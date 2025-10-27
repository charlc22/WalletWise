# WalletWise Quick Start Guide

## 🚀 For Employers & Reviewers

### Live Demo (Coming Soon)
Once deployed, access the live demo at: [URL will be added]

**Demo Credentials**:
- Email: demo@walletwise.com
- Password: DemoPass123!

---

## 📦 Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/charlc22/WalletWise.git
cd WalletWise
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Database

**Option A: Use MongoDB Atlas (Recommended for production)**

Follow the [Database Migration Guide](./DATABASE_MIGRATION_GUIDE.md)

**Option B: Use Local MongoDB (Development only)**

```bash
# Install MongoDB
brew install mongodb-community@6.0  # macOS
# OR
sudo apt install mongodb  # Linux

# Start MongoDB
brew services start mongodb-community@6.0  # macOS
# OR
sudo systemctl start mongod  # Linux
```

Create `.env` file:
```bash
MONGODB_URI=mongodb://localhost:27017/financetracker
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
PORT=55000
NODE_ENV=development
REACT_APP_API_URL=http://localhost:55000/api
```

### 4. Test Database Connection

```bash
npm run test-db
```

You should see:
```
✓ Successfully connected to MongoDB!
Database Statistics:
─────────────────────
Total Users:       X
Total Statements:  Y
...
```

### 5. Create Demo Account (Optional)

```bash
npm run create-demo
```

Follow the prompts to create a demo account.

### 6. Start Application

**Terminal 1 - Backend**:
```bash
npm run server
```

**Terminal 2 - Frontend**:
```bash
npm start
```

The app will open at http://localhost:3000

---

## 🧪 Testing ML Features

### 1. Upload Bank Statement

- Login or register
- Go to Dashboard
- Click "Upload Statement"
- Upload a PDF bank statement
- Wait 10-30 seconds for processing

### 2. View ML Analytics

Once processed, navigate to:
- **Risk Analysis**: See fraud, cash flow, overspending, liquidity, and concentration risks
- **Health Score**: View your financial health grade (A-F)
- **Insights**: Read personalized recommendations

### 3. API Testing (Optional)

```bash
# Get JWT token by logging in
TOKEN="your_jwt_token_here"

# Test ML endpoints
curl http://localhost:55000/api/bankStatements/ml/analytics \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:55000/api/bankStatements/ml/health-score \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:55000/api/bankStatements/ml/risk-analysis \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🗂️ Project Structure

```
WalletWise/
├── src/                          # React frontend
│   ├── components/              # UI components
│   │   ├── auth/               # Login/Register
│   │   ├── dashboard/          # Main dashboard
│   │   ├── forms/              # Upload forms
│   │   └── layout/             # Navbar/Footer
│   ├── services/               # API clients
│   └── context/                # React Context
│
├── server/                       # Node.js backend
│   ├── routes/                 # API routes
│   │   ├── auth.js            # Authentication
│   │   └── BankStatements.js  # Statements + ML
│   ├── models/                 # MongoDB schemas
│   ├── middleware/             # Auth middleware
│   ├── ml/                     # 🆕 ML Features
│   │   ├── models/            # Category predictor
│   │   ├── engines/           # Risk, health, insights
│   │   └── mlService.js       # Main ML service
│   ├── scripts/                # Python parsers
│   │   ├── wellsfargo_parser.py
│   │   ├── chase_parser.py
│   │   ├── tdbank_parser.py
│   │   └── universal_parser.py  # 🆕 27+ banks
│   └── utils/                  # Utilities
│
├── ML_FEATURES_DOCUMENTATION.md     # 🆕 ML docs
├── DATABASE_MIGRATION_GUIDE.md      # 🆕 Migration guide
└── DEPLOYMENT_GUIDE.md              # Deployment instructions
```

---

## 🛠️ Available Scripts

```bash
# Frontend
npm start              # Start React development server
npm run build          # Build production frontend

# Backend
npm run server         # Start Express backend

# Database
npm run test-db        # Test MongoDB connection
npm run create-demo    # Create demo account
npm run export-db      # Export database (migration)
npm run import-db      # Import to Atlas (migration)

# Testing
npm test               # Run tests
```

---

## 🌟 Key Features

### 1. Multi-Bank Support
- **27+ banks** supported (Chase, Bank of America, Wells Fargo, Citi, etc.)
- Universal parser for unsupported banks
- Automatic bank identification

### 2. ML-Powered Analytics
- **Smart categorization** with confidence scores
- **Risk analysis** across 5 dimensions
- **Financial health score** with letter grades
- **Personalized insights** with priority levels

### 3. Risk Analysis Dimensions
1. **Fraud Risk**: Anomaly detection, duplicate transactions
2. **Cash Flow Risk**: Burn rate, income volatility
3. **Overspending Risk**: Budget deviation, spending trends
4. **Liquidity Risk**: Emergency fund, recurring expenses
5. **Concentration Risk**: HHI calculation, diversification

### 4. Statistical Methods
- Z-score analysis
- Coefficient of variation
- Herfindahl-Hirschman Index
- TF-IDF for NLP
- Time series analysis

---

## 📊 Technology Stack

**Frontend**:
- React 19
- Material-UI
- Chart.js & Recharts
- Axios

**Backend**:
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Natural (NLP library)

**ML/Analytics**:
- TF-IDF classification
- Statistical analysis
- Pattern matching
- Risk modeling

**PDF Processing**:
- Python 3
- pdfplumber

---

## 🎓 For Risk Analyst Internships

This project demonstrates:

✅ **Quantitative Risk Assessment**
- Multi-dimensional risk modeling
- Weighted composite scoring
- Statistical analysis (Z-scores, HHI, CV)

✅ **Financial Data Science**
- ML model implementation
- Feature engineering
- Model evaluation

✅ **Business Intelligence**
- Actionable insights generation
- Risk-based recommendations
- Alert prioritization

✅ **Full-Stack Development**
- API design (RESTful)
- Database optimization
- Real-time analytics pipeline

---

## 📚 Documentation

- [ML Features Documentation](./ML_FEATURES_DOCUMENTATION.md)
- [Database Migration Guide](./DATABASE_MIGRATION_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

## 🐛 Troubleshooting

### "Python script not found"

```bash
# Verify Python installation
which python3

# Install pdfplumber
pip3 install pdfplumber
```

### "MongoDB connection failed"

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Verify connection string in .env
cat .env | grep MONGODB_URI
```

### "Port already in use"

```bash
# Kill process on port 55000
lsof -i :55000
kill -9 <PID>
```

---

## 🤝 Contributing

This is a capstone project for a Financial Data Science Master's program. Feedback and suggestions welcome!

---

## 📧 Contact

- **Author**: Financial Data Science Master's Student
- **Purpose**: Risk Analyst Internship Portfolio
- **GitHub**: https://github.com/charlc22/WalletWise

---

**Last Updated**: 2025-10-27
