import { useEffect, useState } from 'react';
import LiveDeliveryMap from '../components/LiveDeliveryMap';

/**
 * Example usage of LiveDeliveryMap with real-time WebSocket tracking
 * 
 * This component demonstrates:
 * 1. Fetching initial location data from the backend
 * 2. Passing the orderId to enable WebSocket tracking
 * 3. Handling location updates
 * 4. Displaying delivery status
 */
export default function OrderTrackingPage({ orderId }) {
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  // Fetch initial location data
  useEffect(() => {
    if (!orderId) return;

    const fetchLocation = async () => {
      try {
        setLoading(true);

        // Fetch last known location from Redis (for initial map load)
        const response = await fetch(
          `/api/location/orders/${orderId}/last-location`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          // If no location yet, use default coordinates
          console.warn('No location data available yet');
          setDeliveryLocation({
            lat: 28.6139, // Default to Delhi
            lng: 77.209,
          });
          return;
        }

        const data = await response.json();
        setDeliveryLocation({
          lat: data.lat,
          lng: data.lng,
        });
        setRiderLocation({
          lat: data.lat,
          lng: data.lng,
        });
      } catch (err) {
        console.error('Error fetching location:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [orderId]);

  // Fetch order details
  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Loading tracking information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'red' }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', gap: '20px', padding: '20px' }}>
      {/* Map Container - 70% width */}
      <div style={{ flex: '0 0 70%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {deliveryLocation && (
          <LiveDeliveryMap
            orderId={orderId}
            deliveryCoords={deliveryLocation}
            trackingCoords={riderLocation}
            onLocationUpdate={(newLocation) => {
              setRiderLocation(newLocation);
            }}
            token={localStorage.getItem('token')}
            showFollowMe={true}
          />
        )}
      </div>

      {/* Order Details Sidebar - 30% width */}
      <div
        style={{
          flex: '0 0 30%',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Order Details</h2>

        {orderDetails && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '8px 0' }}>
                <strong>Order ID:</strong> #{orderDetails.order_id}
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    backgroundColor:
                      orderDetails.status === 'Delivered'
                        ? '#d1fae5'
                        : orderDetails.status === 'In Transit'
                          ? '#dbeafe'
                          : '#fef3c7',
                    color:
                      orderDetails.status === 'Delivered'
                        ? '#065f46'
                        : orderDetails.status === 'In Transit'
                          ? '#0c4a6e'
                          : '#b45309',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {orderDetails.status}
                </span>
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Product:</strong> {orderDetails.product_name}
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Price:</strong> ₹{orderDetails.price}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Delivery Information</h3>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Carrier:</strong> {orderDetails.carrier || 'Standard Delivery'}
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Delivery Slot:</strong> {orderDetails.delivery_slot || 'Today'}
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Expected Delivery:</strong>{' '}
                {orderDetails.expected_delivery
                  ? new Date(orderDetails.expected_delivery).toLocaleString()
                  : 'Not yet scheduled'}
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Current Location:</strong> {orderDetails.current_location || 'In transit'}
              </p>
            </div>

            {riderLocation && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Live Location</h3>
                <p style={{ margin: '8px 0', fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' }}>
                  Latitude: {riderLocation.lat.toFixed(6)}
                </p>
                <p style={{ margin: '8px 0', fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' }}>
                  Longitude: {riderLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </>
        )}

        {!orderDetails && (
          <p style={{ color: '#6b7280' }}>Loading order details...</p>
        )}
      </div>
    </div>
  );
}
