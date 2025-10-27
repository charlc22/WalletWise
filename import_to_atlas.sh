#!/bin/bash
# MongoDB Atlas Import Script
# This script imports your exported data to MongoDB Atlas

echo "=== MongoDB Atlas Import ==="
echo ""

# Check if export directory exists
EXPORT_DIR=$(ls -td mongodb_export_* 2>/dev/null | head -1)

if [ -z "$EXPORT_DIR" ]; then
    echo "✗ No export directory found. Please run ./migrate_db.sh first"
    exit 1
fi

echo "Found export directory: $EXPORT_DIR"
echo ""

# Prompt for Atlas connection string
read -p "Enter your MongoDB Atlas connection string: " ATLAS_URI
echo ""

if [ -z "$ATLAS_URI" ]; then
    echo "✗ Connection string cannot be empty"
    exit 1
fi

echo "Importing data to MongoDB Atlas..."
echo ""

# Import the database
mongorestore --uri="$ATLAS_URI" "$EXPORT_DIR/financetracker" --nsInclude="financetracker.*"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Import completed successfully!"
    echo ""
    echo "Your data is now on MongoDB Atlas!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with new MONGODB_URI"
    echo "2. Test local connection: npm run test-db"
    echo "3. Deploy application with new connection string"
else
    echo "✗ Import failed. Please check your connection string."
    exit 1
fi
