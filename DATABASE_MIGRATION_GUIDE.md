# Database Migration Guide: Private Server → MongoDB Atlas

## Overview
This guide will help you migrate your WalletWise database from your friend's home server to MongoDB Atlas, making it accessible for employer demos.

---

## Why Migrate to MongoDB Atlas?

✅ **Publicly Accessible**: No VPN required
✅ **Free Tier**: 512MB storage (sufficient for demo)
✅ **Professional**: Shows cloud deployment experience
✅ **Reliable**: 99.95% uptime SLA
✅ **Secure**: Built-in authentication and encryption

---

## Migration Steps

### Step 1: Export Current Database

**Option A: Using the provided script (Recommended)**

```bash
cd /home/user/WalletWise

# Run the export script
./migrate_db.sh
```

This will create a directory like `mongodb_export_20251027_143022` with your data.

**Option B: Manual export**

```bash
# Export entire database
mongodump --uri="mongodb://192.168.105.23:27017/financetracker" --out=./mongodb_backup

# Or export specific collections
mongodump --uri="mongodb://192.168.105.23:27017/financetracker" \
  --collection=users \
  --collection=bankstatements \
  --out=./mongodb_backup
```

**Verify export:**
```bash
ls -lh mongodb_export_*/financetracker/
# You should see: users.bson, users.metadata.json, bankstatements.bson, etc.
```

---

### Step 2: Create MongoDB Atlas Account

1. **Go to**: https://www.mongodb.com/cloud/atlas/register

2. **Sign up** with:
   - Google account (fastest)
   - OR email + password

3. **Choose deployment**:
   - Click "Build a Database"
   - Select **FREE** tier (M0 Sandbox)
   - Cloud Provider: **AWS** (recommended)
   - Region: Choose closest to you (e.g., US East for better latency)
   - Cluster Name: `WalletWise-Production`
   - Click **Create**

4. **Wait 3-5 minutes** for cluster provisioning

---

### Step 3: Configure Atlas Security

#### A. Create Database User

1. Click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `walletwise_admin`
5. Password: **Generate secure password** (save this!)
6. Database User Privileges: **Atlas Admin**
7. Click **Add User**

#### B. Whitelist IP Addresses

1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. For demo purposes, choose:
   - **Allow Access from Anywhere** (0.0.0.0/0)
   - This allows employers to access your demo
4. Click **Confirm**

**⚠️ Security Note**: For production apps, restrict to specific IPs. For portfolio demos, "anywhere" is acceptable.

---

### Step 4: Get Connection String

1. Click **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string

It will look like:
```
mongodb+srv://walletwise_admin:<password>@walletwise-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Replace `<password>`** with your actual password
8. **Add database name** before the `?`:
```
mongodb+srv://walletwise_admin:YOUR_PASSWORD@walletwise-production.xxxxx.mongodb.net/financetracker?retryWrites=true&w=majority
```

---

### Step 5: Import Data to Atlas

**Option A: Using the provided script (Recommended)**

```bash
cd /home/user/WalletWise

# Run the import script
./import_to_atlas.sh

# When prompted, paste your Atlas connection string
# (the one you copied in Step 4)
```

**Option B: Manual import**

```bash
# Replace with your actual connection string
ATLAS_URI="mongodb+srv://walletwise_admin:PASSWORD@cluster.mongodb.net/financetracker"

# Import the data
mongorestore --uri="$ATLAS_URI" ./mongodb_export_*/financetracker --nsInclude="financetracker.*"
```

**Verify import:**
```bash
# Use MongoDB Shell (mongosh) to verify
mongosh "$ATLAS_URI"

# In the shell:
> show collections
> db.users.countDocuments()
> db.bankstatements.countDocuments()
> exit
```

---

### Step 6: Update Application Configuration

#### Update .env file

```bash
cd /home/user/WalletWise

# Backup old .env
cp .env .env.backup

# Edit .env
nano .env
```

Update the `MONGODB_URI`:
```bash
# Old (private server)
# MONGODB_URI=mongodb://192.168.105.23:27017/financetracker

# New (MongoDB Atlas)
MONGODB_URI=mongodb+srv://walletwise_admin:YOUR_PASSWORD@walletwise-production.xxxxx.mongodb.net/financetracker?retryWrites=true&w=majority
```

Save and exit (Ctrl+X, Y, Enter)

---

### Step 7: Test Connection Locally

```bash
# Test the connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'YOUR_ATLAS_URI')
  .then(() => {
    console.log('✓ Successfully connected to MongoDB Atlas!');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Connection failed:', err.message);
    process.exit(1);
  });
"
```

If successful, you'll see:
```
✓ Successfully connected to MongoDB Atlas!
```

---

### Step 8: Deploy Application

Now deploy your app with the new Atlas connection string. Choose one:

#### Option A: Heroku (Easiest)

```bash
# If not already set up
heroku create walletwise-demo

# Set the new MongoDB URI
heroku config:set MONGODB_URI="mongodb+srv://walletwise_admin:PASSWORD@cluster.mongodb.net/financetracker?retryWrites=true&w=majority"

# Deploy
git push heroku claude/capstone-project-setup-011CUU2TxStaDg51qkR3TZ7H:main

# Open app
heroku open
```

#### Option B: Railway

1. Go to https://railway.app
2. Create new project from GitHub
3. Add environment variable:
   - Key: `MONGODB_URI`
   - Value: Your Atlas connection string
4. Deploy

#### Option C: Vercel + Railway (Separate Frontend/Backend)

**Backend (Railway)**:
1. Deploy backend to Railway with Atlas URI

**Frontend (Vercel)**:
1. Update `REACT_APP_API_URL` to Railway URL
2. Deploy to Vercel

---

### Step 9: Verify Deployed Application

1. **Visit your deployed URL**
2. **Test the following**:
   - ✅ User registration
   - ✅ User login
   - ✅ Bank statement upload
   - ✅ Statement processing
   - ✅ ML analytics (risk, health score, insights)
   - ✅ Dashboard visualizations

---

## 📊 Monitor Your Atlas Cluster

### View Data in Atlas UI

1. Go to https://cloud.mongodb.com
2. Click **Browse Collections**
3. You can see:
   - All users
   - All bank statements
   - Run queries
   - View indexes

### Check Performance

1. Click **Metrics** tab
2. Monitor:
   - Connections
   - Network usage
   - Storage usage
   - Operations per second

---

## 🎯 For Employer Demos

### Create Demo Credentials

Create a test account with pre-loaded data:

```javascript
// demo_setup.js
const mongoose = require('mongoose');
const User = require('./server/models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'YOUR_ATLAS_URI';

async function createDemoAccount() {
  await mongoose.connect(MONGODB_URI);

  const demoUser = new User({
    email: 'demo@walletwise.com',
    password: await bcrypt.hash('DemoPass123!', 10),
    name: 'Demo User'
  });

  await demoUser.save();
  console.log('✓ Demo account created: demo@walletwise.com / DemoPass123!');

  process.exit(0);
}

createDemoAccount();
```

Run it:
```bash
node demo_setup.js
```

### Create a Demo Page

Add to your README:

```markdown
## 🚀 Live Demo

**URL**: https://walletwise-demo.herokuapp.com

**Demo Credentials**:
- Email: demo@walletwise.com
- Password: DemoPass123!

**Features to Try**:
1. Upload a bank statement (PDF)
2. View ML-powered risk analysis
3. Check financial health score
4. Read personalized insights
```

---

## 🔒 Security Best Practices

### 1. Use Environment Variables

Never commit connection strings to Git:

```bash
# .gitignore should include:
.env
.env.local
.env.production
```

### 2. Rotate Passwords Periodically

In Atlas:
1. Database Access → Edit User
2. Click "Edit Password"
3. Generate new password
4. Update in deployment platform

### 3. Monitor Suspicious Activity

Atlas provides:
- Real-time alerts
- Access logs
- Query profiling

---

## 💰 Cost Management

### Free Tier Limits

- **Storage**: 512 MB
- **RAM**: 512 MB shared
- **Connections**: 500 concurrent
- **Backup**: Manual only

### If You Exceed Free Tier

**Option 1**: Upgrade to M10 (~$0.08/hour = ~$57/month)

**Option 2**: Clean up old data:
```javascript
// Delete old statements (keep last 3 months)
const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

db.bankstatements.deleteMany({
  uploadDate: { $lt: threeMonthsAgo }
});
```

**Option 3**: Compress PDFs before storage

---

## 🐛 Troubleshooting

### Error: "Connection timed out"

**Solution**:
1. Check Network Access in Atlas
2. Ensure 0.0.0.0/0 is whitelisted
3. Verify connection string format

### Error: "Authentication failed"

**Solution**:
1. Verify username and password
2. Check user has correct privileges
3. Ensure password is URL-encoded:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`

Example:
```
# If password is: P@ss#123
# Encode as: P%40ss%23123

mongodb+srv://user:P%40ss%23123@cluster.mongodb.net/db
```

### Error: "Namespace not found"

**Solution**:
1. Database name might be wrong
2. Check: `financetracker` vs `finance_tracker`
3. Verify collections exist:
```bash
mongosh "YOUR_ATLAS_URI"
> show dbs
> use financetracker
> show collections
```

### Connection works locally but not in deployment

**Solution**:
1. Check environment variable is set in deployment platform
2. Verify no trailing spaces in connection string
3. Test with:
```bash
heroku config  # View all env vars
heroku config:get MONGODB_URI  # Check specific var
```

---

## 📸 Creating Demo Videos/Screenshots

### 1. Screen Recording Tools

- **macOS**: QuickTime Screen Recording
- **Windows**: Xbox Game Bar (Win+G)
- **Cross-platform**: OBS Studio (free)

### 2. What to Demonstrate

1. **Login/Registration**
2. **Upload Bank Statement** (use sample PDF)
3. **Processing Animation**
4. **Dashboard Overview**
5. **ML Analytics**:
   - Risk Analysis breakdown
   - Financial Health Score
   - Personalized Insights
6. **Category Predictions**
7. **Statement Comparison**

### 3. Screenshot Key Features

```bash
# Create a screenshots folder
mkdir ~/WalletWise-Screenshots

# Take screenshots of:
# - Risk Analysis dashboard
# - Health Score display
# - Insights panel
# - Category breakdown
```

---

## 🎓 Resume/Portfolio Talking Points

After migration, you can say:

✅ "Migrated production database from on-premise to **MongoDB Atlas** cloud platform"

✅ "Implemented **secure cloud deployment** with authentication and network access controls"

✅ "Configured **environment-based configuration** for development, staging, and production"

✅ "Demonstrated **database migration** and **data engineering** best practices"

✅ "Created **publicly accessible demo** for portfolio presentations"

---

## 📋 Quick Reference

### Connection Strings

**Development (Local)**:
```
mongodb://localhost:27017/financetracker
```

**Production (Atlas)**:
```
mongodb+srv://user:pass@cluster.mongodb.net/financetracker?retryWrites=true&w=majority
```

### Common Commands

```bash
# Export from current DB
mongodump --uri="mongodb://192.168.105.23:27017/financetracker" --out=./backup

# Import to Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster/db" ./backup/financetracker

# Test connection
mongosh "mongodb+srv://user:pass@cluster/db"

# Check data
mongosh "mongodb+srv://user:pass@cluster/db" --eval "db.users.countDocuments()"
```

---

## ✅ Migration Checklist

- [ ] Export data from current MongoDB
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (Free M0 tier)
- [ ] Configure database user
- [ ] Whitelist IP addresses (0.0.0.0/0)
- [ ] Get connection string
- [ ] Import data to Atlas
- [ ] Verify data import
- [ ] Update .env file
- [ ] Test connection locally
- [ ] Update deployment environment variables
- [ ] Deploy application
- [ ] Test deployed application
- [ ] Create demo credentials
- [ ] Update README with demo info
- [ ] Take screenshots for portfolio
- [ ] Share demo URL with potential employers

---

## 🆘 Need Help?

### MongoDB Atlas Support

- **Documentation**: https://docs.atlas.mongodb.com
- **Community Forums**: https://www.mongodb.com/community/forums
- **University (Free Courses)**: https://university.mongodb.com

### Check Your Data

```javascript
// Quick data verification script
const mongoose = require('mongoose');

async function verifyData() {
  await mongoose.connect('YOUR_ATLAS_URI');

  const User = require('./server/models/User');
  const BankStatement = require('./server/models/BankStatement');

  const userCount = await User.countDocuments();
  const statementCount = await BankStatement.countDocuments();

  console.log(`Users: ${userCount}`);
  console.log(`Statements: ${statementCount}`);

  // Show first user (without password)
  const user = await User.findOne().select('-password');
  console.log('Sample user:', user);

  // Show first statement
  const statement = await BankStatement.findOne().select('-pdfData');
  console.log('Sample statement:', statement);

  process.exit(0);
}

verifyData();
```

---

**Last Updated**: 2025-10-27
**Version**: 1.0

Good luck with your migration! Your employers will be impressed with the professional cloud deployment! 🚀
