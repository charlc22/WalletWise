# WalletWise ML Features Documentation

## Overview
This document describes the machine learning and risk analysis features added to WalletWise for financial data science capabilities.

## Author
**For Master's Degree in Financial Data Science Capstone Project**

## Features Implemented

### 1. Smart Category Prediction
**Location**: `server/ml/models/categoryPredictor.js`

**Description**: ML-powered transaction categorization using TF-IDF (Term Frequency-Inverse Document Frequency) and pattern matching.

**Capabilities**:
- 17 pre-defined spending categories
- Confidence scoring for each prediction
- Alternative category suggestions
- Batch prediction for multiple transactions
- Model evaluation metrics (accuracy, confusion matrix)

**Key Methods**:
- `train(transactions)` - Train model on historical data
- `predict(description, amount)` - Predict category with confidence score
- `batchPredict(transactions)` - Process multiple transactions
- `evaluate(testTransactions)` - Calculate accuracy metrics

**Example Output**:
```javascript
{
  category: 'Restaurants & Fast Food',
  confidence: 87.5,
  alternatives: [
    { category: 'Groceries', confidence: 12.3 }
  ]
}
```

---

### 2. Multi-Dimensional Risk Analysis
**Location**: `server/ml/engines/riskAnalyzer.js`

**Description**: Comprehensive financial risk assessment across 5 key dimensions designed for risk analyst portfolios.

#### Risk Dimensions

**A. Fraud Risk (Weight: 25%)**
- Unusual transaction pattern detection (Z-score based)
- High-value transaction flagging
- Rapid transaction detection (velocity checking)
- Duplicate transaction identification
- Category anomaly detection

**B. Cash Flow Risk (Weight: 30%)**
- Net cash flow analysis (income vs expenses)
- Burn rate calculation (days until funds depleted)
- Income volatility measurement
- Expense ratio analysis

**C. Overspending Risk (Weight: 20%)**
- Month-over-month spending comparison
- Category-wise spending increases
- Discretionary spending ratio
- Budget deviation detection

**D. Liquidity Risk (Weight: 15%)**
- Recurring expense coverage ratio
- Emergency fund adequacy (3-6 months recommended)
- Short-term obligation assessment

**E. Concentration Risk (Weight: 10%)**
- Herfindahl-Hirschman Index (HHI) calculation
- Category spending concentration
- Merchant concentration analysis

**Risk Scoring**:
- 0-24: Low risk
- 25-49: Medium risk
- 50-74: High risk
- 75-100: Critical risk

**Example Output**:
```javascript
{
  compositeRiskScore: 42,
  riskLevel: 'medium',
  dimensions: {
    fraudRisk: { score: 15, level: 'low', flags: [...] },
    cashFlowRisk: { score: 65, level: 'high', flags: [...] },
    overspendingRisk: { score: 30, level: 'medium', flags: [...] },
    liquidityRisk: { score: 50, level: 'high', flags: [...] },
    concentrationRisk: { score: 25, level: 'medium', flags: [...] }
  },
  alerts: [{ severity: 'high', type: 'NEGATIVE_CASH_FLOW', ... }],
  recommendations: [...]
}
```

---

### 3. Financial Health Scoring
**Location**: `server/ml/engines/financialHealthScore.js`

**Description**: Industry-standard composite health score (0-100) with letter grades.

#### Scoring Dimensions

**A. Spending Discipline (25%)**
- Spending consistency (coefficient of variation)
- Impulse buying detection
- Discretionary spending ratio

**B. Savings Rate (20%)**
- Income vs expenses analysis
- Benchmarked against 15-20% recommended rate
- Trend analysis for consistent saving

**C. Budget Adherence (15%)**
- Historical spending pattern comparison
- Category budget deviation tracking

**D. Risk Exposure (20%)**
- Inverse of composite risk score
- Multi-dimensional risk assessment

**E. Financial Stability (15%)**
- Income stability measurement
- Emergency fund adequacy (months covered)

**F. Diversification (5%)**
- Spending category distribution
- HHI-based diversification score

**Grading Scale**:
- A+ (90-100): Excellent financial health
- A (85-89): Very good health
- B (70-79): Good health
- C (55-69): Fair health
- D (40-54): Poor health
- F (<40): Critical health issues

**Example Output**:
```javascript
{
  score: 78,
  grade: 'B',
  level: 'good',
  dimensions: {
    spendingDiscipline: { score: 85, weight: 0.25, reasons: [...] },
    savingsRate: { score: 70, weight: 0.20, reasons: [...] },
    // ... other dimensions
  },
  insights: [
    { type: 'positive', message: 'Excellent savings rate (20%+ of income)' }
  ],
  recommendations: [...]
}
```

---

### 4. Personalized Insights Generator
**Location**: `server/ml/engines/insightsGenerator.js`

**Description**: Natural language generation of actionable financial insights.

**Insight Categories**:

1. **Spending Patterns**
   - Overall spending changes
   - Category-specific trends
   - Unusual activity alerts

2. **Savings Analysis**
   - Savings rate assessment
   - Savings opportunities identification
   - Goal progress tracking

3. **Trend Analysis**
   - 3-month spending trends
   - Category trend detection
   - Forecasting future spending

4. **Risk-Based Insights**
   - Critical alert notifications
   - Risk dimension warnings
   - Fraud pattern alerts

5. **Health-Based Insights**
   - Overall health assessment
   - Strength and weakness identification
   - Improvement recommendations

**Priority Levels**:
- **Critical**: Immediate action required
- **High**: Important, act soon
- **Medium**: Monitor and address
- **Low**: Informational

**Example Output**:
```javascript
[
  {
    type: 'warning',
    category: 'Cash Flow Risk',
    message: 'Your cash flow shows concerning patterns. You may be spending close to or more than you earn.',
    priority: 'high',
    actionable: true,
    action: 'Create a budget and track all expenses to improve cash flow.',
    metrics: { netCashFlow: -250.00 }
  },
  {
    type: 'positive',
    category: 'Savings',
    message: 'Excellent! You saved 22.5% of your income ($675.00) this month.',
    priority: 'low',
    actionable: false
  }
]
```

---

### 5. Enhanced Bank Support
**Location**: `server/utils/bank_identifier.py`, `server/scripts/universal_parser.py`

**Description**: Expanded from 3 banks to 27+ banks with universal fallback parser.

**Supported Banks**:
1. Chase
2. Bank of America
3. Wells Fargo
4. Citibank
5. US Bank
6. PNC Bank
7. TD Bank
8. Capital One
9. Truist
10. Goldman Sachs
11. Charles Schwab
12. American Express
13. Discover
14. Ally Bank
15. Navy Federal
16. USAA
17. Regions Bank
18. KeyBank
19. Citizens Bank
20. Fifth Third Bank
21. BMO Harris
22. Huntington Bank
23. SunTrust
24. BB&T
25. Santander
26. HSBC
27. Barclays

**Universal Parser Features**:
- Multiple date format detection (MM/DD/YYYY, MM-DD-YYYY, Month DD YYYY)
- Pattern-based transaction extraction
- Automatic categorization
- Fallback mechanism for unknown banks
- Duplicate transaction removal

---

## API Endpoints

### ML Analytics Endpoints

**Base URL**: `/api/bankStatements/ml`

#### 1. Get Comprehensive Analytics
```
GET /ml/analytics
Authorization: Required (JWT)
```

**Response**:
```javascript
{
  success: true,
  analytics: {
    riskAnalysis: { ... },
    financialHealthScore: { ... },
    insights: [ ... ],
    categoryPredictions: [ ... ],
    summary: {
      healthGrade: 'B',
      healthScore: 78,
      riskLevel: 'medium',
      riskScore: 42,
      criticalAlerts: 0,
      highPriorityInsights: 3,
      overallStatus: 'good'
    }
  },
  statementsAnalyzed: 3
}
```

#### 2. Get Risk Analysis Only
```
GET /ml/risk-analysis
Authorization: Required (JWT)
```

#### 3. Get Financial Health Score Only
```
GET /ml/health-score
Authorization: Required (JWT)
```

#### 4. Get Personalized Insights Only
```
GET /ml/insights
Authorization: Required (JWT)
```

#### 5. Trigger ML Re-Analysis
```
POST /ml/reanalyze
Authorization: Required (JWT)
```

---

## Data Models

### Updated BankStatement Schema

```javascript
{
  mlResults: {
    expenses: [Transaction],
    totalExpenses: Number,
    totalCredits: Number,
    totalTransactions: Number,
    processedDate: Date,
    categoryBreakdown: Object,

    // NEW: ML Analytics
    riskAnalysis: {
      compositeRiskScore: Number,
      riskLevel: String,
      timestamp: Date,
      dimensions: {
        fraudRisk: Object,
        cashFlowRisk: Object,
        overspendingRisk: Object,
        liquidityRisk: Object,
        concentrationRisk: Object
      },
      alerts: [Object],
      recommendations: [Object]
    },

    financialHealthScore: {
      score: Number,
      grade: String,
      level: String,
      timestamp: Date,
      dimensions: Object,
      insights: [Object],
      recommendations: [Object],
      benchmarkComparison: Object
    },

    insights: [Object],

    categoryPredictions: [{
      transactionId: String,
      predictedCategory: String,
      confidence: Number,
      alternatives: [Object]
    }]
  }
}
```

---

## Technical Architecture

### ML Service Flow

```
1. Bank Statement Upload (PDF)
   ↓
2. Bank Identification (27+ banks)
   ↓
3. Statement Parsing (Specific or Universal Parser)
   ↓
4. Transaction Extraction & Categorization
   ↓
5. ML Analysis Pipeline:
   a. Category Prediction (TF-IDF + Pattern Matching)
   b. Risk Analysis (5 dimensions, weighted scoring)
   c. Financial Health Scoring (6 dimensions, letter grade)
   d. Insights Generation (NLG, prioritized)
   ↓
6. Results Storage (MongoDB)
   ↓
7. API Response (JSON)
```

### ML Service Singleton

**Location**: `server/ml/mlService.js`

**Key Methods**:
- `initialize(historicalTransactions)` - Train models
- `analyzeUserFinancials(statements)` - Complete analysis
- `getRiskAnalysis(statements)` - Risk analysis only
- `getHealthScore(statements)` - Health score only
- `getInsights(statements)` - Insights only
- `recategorizeTransactions(transactions)` - Re-categorize

---

## Risk Analysis Methodology

### Statistical Methods Used

1. **Z-Score Analysis**
   - Used for detecting unusual transaction amounts
   - Threshold: ±3 standard deviations from mean

2. **Coefficient of Variation (CV)**
   - Measures spending consistency
   - Formula: CV = σ / μ
   - High CV (>1.0) indicates volatility

3. **Herfindahl-Hirschman Index (HHI)**
   - Measures spending concentration
   - Formula: HHI = Σ(market_share²)
   - Range: 0 (perfect diversification) to 1 (complete concentration)
   - Thresholds:
     - <0.15: Low concentration
     - 0.15-0.25: Moderate concentration
     - >0.25: High concentration

4. **Cash Flow Ratio**
   - Formula: Total Debits / Total Credits
   - Ideal: <0.7 (saving 30%+)
   - Warning: 0.7-0.9 (saving 10-30%)
   - Critical: >0.9 (saving <10%)

5. **Burn Rate Analysis**
   - Formula: Days Until Zero = Net Cash Flow / (Daily Spending - Daily Income)
   - Warning if <30 days

---

## Industry Best Practices

### Benchmarks Used

1. **Savings Rate**: 15-20% of income recommended
2. **Emergency Fund**: 3-6 months of expenses
3. **Debt-to-Income**: <36% recommended
4. **Discretionary Spending**: <30% of income
5. **Financial Health Score**: 70+ considered good

---

## Machine Learning Techniques

### 1. TF-IDF (Term Frequency-Inverse Document Frequency)
- Applied to transaction descriptions
- Used for category prediction
- Weighs importance of words across document corpus

### 2. Pattern Matching
- Regular expressions for transaction identification
- Multiple date format recognition
- Merchant name extraction

### 3. Statistical Anomaly Detection
- Z-score based outlier detection
- Time-series trend analysis
- Volatility measurement

### 4. Natural Language Generation (NLG)
- Template-based insight generation
- Context-aware messaging
- Priority-based ordering

---

## Use Cases for Risk Analyst Internships

This implementation demonstrates:

1. **Quantitative Risk Assessment**
   - Multi-dimensional risk modeling
   - Weighted composite scoring
   - Statistical analysis (Z-scores, HHI, CV)

2. **Financial Health Evaluation**
   - Industry benchmark comparison
   - Trend analysis
   - Forecasting

3. **Data Science Skills**
   - ML model implementation (category prediction)
   - Feature engineering (transaction attributes)
   - Model evaluation (accuracy, confusion matrix)

4. **Business Intelligence**
   - Actionable insights generation
   - Risk-based recommendations
   - Alert prioritization

5. **Full-Stack Integration**
   - API design (RESTful endpoints)
   - Database schema design (MongoDB)
   - Real-time analytics pipeline

---

## Future Enhancements

1. **Deep Learning Models**
   - LSTM for time-series forecasting
   - Neural networks for anomaly detection

2. **Advanced Analytics**
   - Spending forecasting (next month predictions)
   - Budget recommendation engine
   - Savings goal optimization

3. **Visualization**
   - Interactive risk dashboards
   - Health score trends over time
   - Category spending heatmaps

4. **Additional Risk Dimensions**
   - Credit utilization tracking
   - Debt analysis
   - Investment portfolio risk

---

## Testing

### To Test ML Features:

1. Upload bank statements via `/api/bankStatements/upload`
2. Wait for processing (automatic)
3. Query ML analytics via `/api/bankStatements/ml/analytics`
4. Review risk analysis, health score, and insights

### Sample Test Flow:

```javascript
// 1. Upload statement
POST /api/bankStatements/upload
Content-Type: multipart/form-data
Body: { statement: <pdf_file>, title: "Test Statement" }

// 2. Wait 10-30 seconds for processing

// 3. Get ML analytics
GET /api/bankStatements/ml/analytics
Authorization: Bearer <jwt_token>

// Response will include:
// - Risk analysis across 5 dimensions
// - Financial health score (0-100, letter grade)
// - Personalized insights (prioritized)
// - Category predictions with confidence scores
```

---

## Dependencies Added

- `natural` (v6.10.4) - NLP library for TF-IDF

---

## Performance Considerations

1. **ML Analysis Timing**
   - Category prediction: ~50-100ms for 100 transactions
   - Risk analysis: ~100-200ms per statement
   - Health scoring: ~50-100ms
   - Total: ~200-400ms for complete analysis

2. **Caching Strategy**
   - ML results stored in MongoDB
   - Re-analysis only on new uploads or manual trigger
   - Reduces redundant computation

3. **Scalability**
   - Singleton ML service (memory efficient)
   - Stateless API endpoints (horizontally scalable)
   - Background processing for uploads (non-blocking)

---

## Deployment Recommendations

### Environment Variables

```bash
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=55000
NODE_ENV=production
```

### Python Requirements

```bash
pip install pdfplumber
```

### Deployment Platforms

1. **Heroku** (Recommended for quick deployment)
   - Free tier available
   - Python buildpack support
   - MongoDB Atlas integration

2. **AWS**
   - Elastic Beanstalk (Node.js + Python)
   - EC2 + RDS/DocumentDB
   - Lambda functions for serverless

3. **Google Cloud**
   - App Engine
   - Cloud Run (containerized)
   - Cloud Functions

4. **Vercel** (Frontend) + **Railway** (Backend)
   - Free tier
   - Easy GitHub integration
   - Automatic deployments

---

## Contact & Support

For questions about the ML implementation:
- Review code comments in `server/ml/` directory
- Check API documentation above
- Test endpoints using Postman or curl

---

**Last Updated**: 2025-10-25
**Version**: 1.0
**Author**: Financial Data Science Master's Student

