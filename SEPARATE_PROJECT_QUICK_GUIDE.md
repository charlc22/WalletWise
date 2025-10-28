# Quick Guide: Create Separate ML Project

## 🎯 Goal
Create a new standalone repository with your ML features while keeping the original WalletWise project intact.

---

## ⚡ Fastest Method (Automated Script)

```bash
cd /home/user/WalletWise
./create_separate_ml_project.sh
```

The script will:
1. ✅ Create new directory with all ML code
2. ✅ Generate ML-focused README
3. ✅ Update package.json
4. ✅ Add MIT license
5. ✅ Create initial git commit

**Time**: ~2 minutes

---

## 📋 Manual Method

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Name: `WalletWise-ML`
3. Description: `ML-powered financial risk analysis system`
4. Public repository
5. Click "Create repository"

### Step 2: Create Local Copy
```bash
cd ~
mkdir WalletWise-ML
cd WalletWise-ML
git init
```

### Step 3: Copy ML Branch Files
```bash
cd /home/user/WalletWise
git checkout claude/capstone-project-setup-011CUU2TxStaDg51qkR3TZ7H

rsync -av --exclude='.git' --exclude='node_modules' \
  /home/user/WalletWise/ ~/WalletWise-ML/
```

### Step 4: Update for ML Focus
```bash
cd ~/WalletWise-ML

# Update README (see CREATE_SEPARATE_PROJECT.md for template)
# Update package.json name to "walletwise-ml"
# Add LICENSE file
```

### Step 5: Push to GitHub
```bash
git add .
git commit -m "Initial commit: ML-powered financial risk analysis system"
git remote add origin https://github.com/YOUR_USERNAME/WalletWise-ML.git
git branch -M main
git push -u origin main
```

---

## ✅ Result

You now have **TWO projects**:

### 1. Original WalletWise (Team Project)
- **Location**: `/home/user/WalletWise`
- **URL**: `https://github.com/charlc22/WalletWise`
- **Status**: Unchanged, intact
- **Your branch**: `claude/capstone-project-setup-011CUU2TxStaDg51qkR3TZ7H`

### 2. WalletWise ML (Your ML Project)
- **Location**: `~/WalletWise-ML`
- **URL**: `https://github.com/YOUR_USERNAME/WalletWise-ML`
- **Status**: New independent project
- **Branch**: `main`

---

## 🎓 For Your Resume

**Project 1**: WalletWise ML - Financial Risk Analysis
- Solo ML/data science project
- 5-dimensional risk modeling
- Statistical analysis: Z-scores, HHI, CV
- 27+ bank support, 6 ML endpoints
- **Link**: https://github.com/YOUR_USERNAME/WalletWise-ML

**Project 2**: WalletWise - Personal Finance Tracker
- Full-stack team collaboration
- Contributed ML features branch
- Database migration and deployment
- **Link**: https://github.com/charlc22/WalletWise

---

## 🚀 After Creating Separate Project

1. **Deploy ML project** to Heroku/Vercel
2. **Migrate database** to MongoDB Atlas
3. **Create demo account**
4. **Update resume** with both project links
5. **Add to LinkedIn** portfolio section

---

## 📊 Comparison

| Aspect | Use Original | Use ML Version |
|--------|-------------|---------------|
| **For general dev roles** | ✅ | |
| **For ML/data science roles** | | ✅ |
| **For risk analyst roles** | | ✅ |
| **Team collaboration showcase** | ✅ | |
| **Solo technical deep-dive** | | ✅ |
| **Quick overview** | ✅ | |
| **Statistical methods focus** | | ✅ |

---

## 💡 Pro Tips

1. **Keep both updated**: Deploy both projects for different audiences
2. **Different READMEs**: Original = features, ML = technical depth
3. **Link them**: Add "based on WalletWise" in ML project
4. **Highlight your work**: ML project shows YOUR specific contributions
5. **Tailor applications**: Send ML version to risk analyst roles

---

## 🆘 Troubleshooting

**"rsync: command not found"**
```bash
# On macOS
brew install rsync

# On Linux (should be pre-installed)
sudo apt install rsync
```

**"Permission denied"**
```bash
chmod +x create_separate_ml_project.sh
```

**"Repository already exists"**
- Delete the repo on GitHub and recreate
- Or use a different name

---

## 📖 Full Documentation

For complete step-by-step instructions, see:
- [CREATE_SEPARATE_PROJECT.md](./CREATE_SEPARATE_PROJECT.md)

---

**Quick Answer**: Run `./create_separate_ml_project.sh` and follow the prompts! 🚀
