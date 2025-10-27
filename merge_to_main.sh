#!/bin/bash
# Merge ML features to main branch

echo "=== Merging ML Features to Main ==="
echo ""

# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature branch
git merge claude/capstone-project-setup-011CUU2TxStaDg51qkR3TZ7H --no-ff -m "Merge ML features: Add risk analysis, health scoring, and migration tools

This merge adds comprehensive ML capabilities for financial risk analysis:
- Multi-dimensional risk scoring (5 dimensions)
- Financial health scoring with letter grades
- Smart category prediction with TF-IDF
- Personalized insights generator
- Enhanced bank support (27+ banks)
- Database migration tools for Atlas deployment

Designed for risk analyst internship portfolio."

# Push to GitHub
git push origin main

echo ""
echo "✓ Successfully merged to main!"
echo ""
echo "View on GitHub: https://github.com/charlc22/WalletWise"
