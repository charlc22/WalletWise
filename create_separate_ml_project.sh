#!/bin/bash
# Automated script to create a separate ML-focused repository

echo "========================================"
echo "  Create Separate WalletWise ML Project"
echo "========================================"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "✗ GitHub username cannot be empty"
    exit 1
fi

# Get new repository name
read -p "Enter new repository name (default: WalletWise-ML): " REPO_NAME
REPO_NAME=${REPO_NAME:-WalletWise-ML}

echo ""
echo "Configuration:"
echo "  GitHub User: $GITHUB_USERNAME"
echo "  New Repo:    $REPO_NAME"
echo ""
read -p "Continue? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "=== Step 1: Creating new directory ==="
cd ~
mkdir -p "$REPO_NAME"
cd "$REPO_NAME"
echo "✓ Created directory: ~/$REPO_NAME"

echo ""
echo "=== Step 2: Initializing git repository ==="
git init
echo "✓ Git repository initialized"

echo ""
echo "=== Step 3: Copying files from ML branch ==="
cd /home/user/WalletWise
git checkout claude/capstone-project-setup-011CUU2TxStaDg51qkR3TZ7H

# Copy all files except .git
rsync -av --exclude='.git' --exclude='node_modules' --exclude='build' /home/user/WalletWise/ ~/"$REPO_NAME"/

echo "✓ Files copied successfully"

echo ""
echo "=== Step 4: Creating ML-focused README ==="
cd ~/"$REPO_NAME"

cat > README.md << 'EOFREADME'
# WalletWise ML - Financial Risk Analysis System

**ML-Powered Personal Finance Risk Assessment & Health Scoring**

> Advanced machine learning system for comprehensive financial risk analysis, health scoring, and personalized insights. Built for risk analyst portfolio.

## 🎯 Purpose

Capstone project for **Financial Data Science Master's Degree**, designed to showcase quantitative risk analysis and machine learning skills for **risk analyst internship applications**.

## 📊 Key Features

### 1. Multi-Dimensional Risk Analysis
- **Fraud Risk**: Z-score anomaly detection, duplicate transactions
- **Cash Flow Risk**: Burn rate analysis, income volatility
- **Overspending Risk**: Budget deviation, MoM spending trends
- **Liquidity Risk**: Emergency fund adequacy
- **Concentration Risk**: HHI calculation, diversification

### 2. Financial Health Scoring
Letter grades (A+ to F) across 6 dimensions:
- Spending Discipline (25%)
- Savings Rate (20%)
- Budget Adherence (15%)
- Risk Exposure (20%)
- Financial Stability (15%)
- Diversification (5%)

### 3. Smart Transaction Categorization
ML-powered categorization using TF-IDF with 17 categories and confidence scores.

### 4. Personalized Insights
Natural language insights with priority-based recommendations.

### 5. Enhanced Bank Support
27+ major banks with universal parser fallback.

## 🧮 Statistical Methods

- Z-Score Analysis (±3σ threshold)
- Coefficient of Variation
- Herfindahl-Hirschman Index
- TF-IDF for NLP
- Time Series Analysis

## 🛠️ Tech Stack

**Backend**: Node.js, Express, MongoDB, Python
**Frontend**: React, Material-UI, Chart.js
**ML**: TF-IDF, Statistical Analysis, Pattern Matching

## 📦 Installation

```bash
git clone https://github.com/GITHUB_USERNAME/REPO_NAME.git
cd REPO_NAME
npm install
pip install pdfplumber

# Configure .env
cp .env.example .env

# Test database
npm run test-db

# Start application
npm run server  # Terminal 1
npm start       # Terminal 2
```

## 🔌 API Endpoints

```bash
GET  /api/bankStatements/ml/analytics       # Complete analysis
GET  /api/bankStatements/ml/risk-analysis   # Risk only
GET  /api/bankStatements/ml/health-score    # Health score only
GET  /api/bankStatements/ml/insights        # Insights only
POST /api/bankStatements/ml/reanalyze       # Re-analyze
```

## 📚 Documentation

- [ML Features Documentation](./ML_FEATURES_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Database Migration](./DATABASE_MIGRATION_GUIDE.md)

## 🎓 For Risk Analyst Internships

This project demonstrates:
- ✅ Quantitative risk assessment
- ✅ Statistical analysis (Z-scores, HHI, CV)
- ✅ Machine learning implementation
- ✅ Financial data engineering
- ✅ Production-ready API design

## 📝 License

MIT License

## 👤 Author

Master's Student in Financial Data Science

**Built with**: React • Node.js • MongoDB • Python • Machine Learning
**For**: Risk Analyst Internship Applications
EOFREADME

# Replace placeholders
sed -i "s/GITHUB_USERNAME/$GITHUB_USERNAME/g" README.md
sed -i "s/REPO_NAME/$REPO_NAME/g" README.md

echo "✓ README.md created"

echo ""
echo "=== Step 5: Updating package.json ==="

# Update package.json name
if [ -f package.json ]; then
    sed -i 's/"name": "financetrackerapp"/"name": "'"$REPO_NAME"'"/' package.json
    echo "✓ package.json updated"
fi

echo ""
echo "=== Step 6: Adding LICENSE ==="

cat > LICENSE << 'EOFLICENSE'
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOFLICENSE

echo "✓ LICENSE created"

echo ""
echo "=== Step 7: Creating initial commit ==="

git add .
git commit -m "Initial commit: ML-powered financial risk analysis system

Features:
- Multi-dimensional risk analysis (5 dimensions)
- Financial health scoring with letter grades
- Smart transaction categorization (TF-IDF)
- Personalized insights generator
- 27+ bank support with universal parser
- Complete documentation and deployment guides

Built for Financial Data Science capstone and risk analyst portfolio."

echo "✓ Initial commit created"

echo ""
echo "========================================"
echo "  ✓ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Create new repository on GitHub:"
echo "   https://github.com/new"
echo "   Name: $REPO_NAME"
echo "   Description: ML-powered financial risk analysis and health scoring system"
echo ""
echo "2. Add remote and push:"
echo "   cd ~/$REPO_NAME"
echo "   git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. View your new project:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "Original project remains at:"
echo "   /home/user/WalletWise (unchanged)"
echo ""
echo "Your new ML project is at:"
echo "   ~/$REPO_NAME"
echo ""
