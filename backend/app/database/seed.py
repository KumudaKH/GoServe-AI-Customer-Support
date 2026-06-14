from app.database.connection import SessionLocal

db = SessionLocal()

print("✅ Database connection successful!")

db.close()