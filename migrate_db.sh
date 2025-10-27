#!/bin/bash
# MongoDB Migration Script
# This script exports data from your current MongoDB instance

echo "=== MongoDB Data Export ==="
echo ""

# Current MongoDB connection (update if needed)
CURRENT_MONGO_URI="mongodb://192.168.105.23:27017/financetracker"

# Export directory
EXPORT_DIR="./mongodb_export_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "Exporting data to: $EXPORT_DIR"
echo ""

# Export the entire database
mongodump --uri="$CURRENT_MONGO_URI" --out="$EXPORT_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Export completed successfully!"
    echo "Data saved to: $EXPORT_DIR"
    echo ""
    echo "Files exported:"
    ls -lh "$EXPORT_DIR/financetracker/"
    echo ""
    echo "Next steps:"
    echo "1. Create MongoDB Atlas account"
    echo "2. Run: ./import_to_atlas.sh"
else
    echo "✗ Export failed. Please check your connection."
    exit 1
fi
