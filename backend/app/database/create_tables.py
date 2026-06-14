from app.database.connection import Base, engine

# Import all models
from app.models.all_models import *

# Create all tables
Base.metadata.create_all(bind=engine)

print("✅ All tables created successfully!")