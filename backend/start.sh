#!/bin/bash
# Wait for postgres to be ready
until pg_isready -h postgres -U examplatform; do
  echo "Waiting for postgres..."
  sleep 2
done

# Run migrations/create tables
python -c "from database import engine, Base; from models import *; Base.metadata.create_all(bind=engine)"

# Seed database
python -c "from seed import seed_database; seed_database()"

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000

