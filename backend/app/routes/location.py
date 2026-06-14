from fastapi import APIRouter, WebSocket, Depends, HTTPException, Query, status, WebSocketException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import json
from typing import Set
import asyncio

from app.database.connection import get_db
from app.models.order import Order
from app.models.delivery_assignment import DeliveryAssignment
from app.utils.dependencies import get_current_user
from app.utils.security import SECRET_KEY, ALGORITHM
from app.services.location_service import LocationService
from app.schemas.location import LocationUpdate, LocationResponse

router = APIRouter(prefix="/api/location", tags=["Location Tracking"])

# Track active WebSocket connections per order
active_connections: dict[int, Set[WebSocket]] = {}


def verify_websocket_token(token: str) -> dict:
    """
    Verify JWT token from WebSocket connection.
    Returns the decoded payload containing user info.
    """
    if not token:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Token required")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")

class ConnectionManager:
    """Manage WebSocket connections for location tracking"""
    
    @staticmethod
    async def connect(websocket: WebSocket, order_id: int):
        """Register a new WebSocket connection"""
        await websocket.accept()
        if order_id not in active_connections:
            active_connections[order_id] = set()
        active_connections[order_id].add(websocket)
        print(f"Client connected to order {order_id}. Active: {len(active_connections[order_id])}")
    
    @staticmethod
    async def disconnect(order_id: int, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if order_id in active_connections:
            active_connections[order_id].discard(websocket)
            if not active_connections[order_id]:
                del active_connections[order_id]
        print(f"Client disconnected from order {order_id}")
    
    @staticmethod
    async def broadcast_to_order(order_id: int, message: dict):
        """Send message to all clients connected to an order"""
        if order_id not in active_connections:
            return
        
        disconnected = set()
        for websocket in active_connections[order_id]:
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to order {order_id}: {e}")
                disconnected.add(websocket)
        
        # Clean up disconnected clients
        for ws in disconnected:
            await ConnectionManager.disconnect(order_id, ws)


# REST Endpoints

@router.get("/orders/{order_id}/last-location", response_model=LocationResponse)
async def get_last_location(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Fetch the last known location for an order from Redis.
    Used for initial map loading.
    """
    # Verify the user has access to this order
    user_id = int(current_user["sub"])
    order = db.query(Order).filter(
        Order.order_id == order_id,
        Order.user_id == user_id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    location = LocationService.get_location(order_id)
    if not location:
        raise HTTPException(
            status_code=404,
            detail="No location data available yet"
        )
    
    return LocationResponse(
        order_id=order_id,
        **location
    )


@router.post("/orders/{order_id}/update")
async def update_location(
    order_id: int,
    location: LocationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Receive location update from delivery partner.
    This endpoint is called by the delivery partner app.
    """
    # Verify the user is the assigned rider for this order
    user_id = int(current_user["sub"])
    assignment = db.query(DeliveryAssignment).filter(
        DeliveryAssignment.order_id == order_id,
        DeliveryAssignment.rider_id == user_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this order's location"
        )
    
    # Save to Redis and broadcast to subscribers
    location_data = location.dict(exclude_none=True)
    LocationService.update_and_publish(order_id, location_data)
    
    # Broadcast to WebSocket clients
    await ConnectionManager.broadcast_to_order(order_id, {
        "type": "location_update",
        "order_id": order_id,
        **location_data
    })
    
    return {
        "status": "success",
        "message": "Location updated"
    }


# WebSocket Endpoints

@router.websocket("/ws/track/{order_id}")
async def websocket_track_delivery(
    websocket: WebSocket,
    order_id: int,
    token: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    WebSocket endpoint for customers to track delivery in real-time.
    Broadcasts location updates from the delivery partner.
    
    Requires:
    - Valid JWT token
    - User must own the order
    """
    try:
        # Validate token
        payload = verify_websocket_token(token)
        user_id = int(payload.get("sub"))
        
        # Verify user owns this order
        order = db.query(Order).filter(
            Order.order_id == order_id,
            Order.user_id == user_id
        ).first()
        
        if not order:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not authorized")
            return
        
        # Accept connection
        await ConnectionManager.connect(websocket, order_id)
        
        # Send last known location on connect
        last_location = LocationService.get_location(order_id)
        if last_location:
            await websocket.send_json({
                "type": "location_update",
                "order_id": order_id,
                **last_location
            })
        
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            if data:
                await websocket.send_json({
                    "type": "pong",
                    "message": "Connection alive"
                })
    except WebSocketException:
        raise
    except Exception as e:
        print(f"WebSocket error for order {order_id}: {e}")
    finally:
        await ConnectionManager.disconnect(order_id, websocket)


@router.websocket("/ws/location/{order_id}")
async def websocket_location_upload(
    websocket: WebSocket,
    order_id: int,
    token: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    WebSocket endpoint for delivery partners to stream location updates.
    Receives location data and stores it for broadcast to customers.
    
    Requires:
    - Valid JWT token
    - User must be assigned as the rider for this order
    """
    try:
        # Validate token
        payload = verify_websocket_token(token)
        user_id = int(payload.get("sub"))
        
        # Verify rider is assigned to this order
        assignment = db.query(DeliveryAssignment).filter(
            DeliveryAssignment.order_id == order_id,
            DeliveryAssignment.rider_id == user_id
        ).first()
        
        if not assignment:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not assigned to this order")
            return
        
        # Accept connection
        await ConnectionManager.connect(websocket, order_id)
        
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected as location provider",
            "order_id": order_id
        })
        
        while True:
            data = await websocket.receive_json()
            
            # Parse location update
            location_update = LocationUpdate(**data)
            
            # Save to Redis and publish
            LocationService.update_and_publish(order_id, location_update.dict(exclude_none=True))
            
            # Broadcast to tracking clients
            await ConnectionManager.broadcast_to_order(order_id, {
                "type": "location_update",
                "order_id": order_id,
                **location_update.dict(exclude_none=True)
            })
            
            # Send acknowledgment to rider
            await websocket.send_json({
                "type": "ack",
                "status": "received",
                "timestamp": data.get("timestamp")
            })
    except WebSocketException:
        raise
    except Exception as e:
        print(f"Location upload error for order {order_id}: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
    finally:
        await ConnectionManager.disconnect(order_id, websocket)
