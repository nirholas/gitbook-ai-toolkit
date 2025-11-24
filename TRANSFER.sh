#!/bin/bash

# GitBook Scraper Transfer Script
# Easily transfer this tool to other repositories

echo "📦 GitBook Scraper Transfer Tool"
echo "=================================="
echo ""

# Get destination path
read -p "Enter destination path (e.g., /path/to/other-repo/tools/): " DEST_PATH

if [ -z "$DEST_PATH" ]; then
  echo "❌ Destination path required"
  exit 1
fi

# Create destination directory
mkdir -p "$DEST_PATH/gitbook-scraper"

echo "📂 Copying files to $DEST_PATH/gitbook-scraper..."

# Copy all files
cp -r src "$DEST_PATH/gitbook-scraper/"
cp -r examples "$DEST_PATH/gitbook-scraper/"
cp -r templates "$DEST_PATH/gitbook-scraper/"
cp -r output "$DEST_PATH/gitbook-scraper/"
cp package.json "$DEST_PATH/gitbook-scraper/"
cp README.md "$DEST_PATH/gitbook-scraper/"
cp TRANSFER.sh "$DEST_PATH/gitbook-scraper/"

echo "✅ Files copied successfully!"
echo ""
echo "📝 Next steps:"
echo "1. cd $DEST_PATH/gitbook-scraper"
echo "2. npm install"
echo "3. npm run scrape -- https://docs.your-gitbook.com"
echo ""
echo "🎉 Transfer complete!"
