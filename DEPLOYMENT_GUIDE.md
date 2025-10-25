# WalletWise Deployment Guide

## Quick Deploy Options

### Option 1: Docker + Cloud Platform (Recommended)

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18

# Install Python and dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install pdfplumber

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 55000

# Start application
CMD ["node", "server/index.js"]
```

#### 2. Create .dockerignore

```
node_modules
build
.git
.env.local
*.log
```

#### 3. Build and Test Locally

```bash
docker build -t walletwise .
docker run -p 55000:55000 -e MONGODB_URI=<your_mongodb_uri> walletwise
```

#### 4. Deploy to Cloud

**AWS Elastic Container Service (ECS)**:
```bash
# Push to ECR
aws ecr create-repository --repository-name walletwise
docker tag walletwise:latest <account-id>.dkr.ecr.<region>.amazonaws.com/walletwise:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/walletwise:latest

# Create ECS service using the pushed image
```

**Google Cloud Run**:
```bash
gcloud builds submit --tag gcr.io/<project-id>/walletwise
gcloud run deploy walletwise --image gcr.io/<project-id>/walletwise --platform managed
```

---

### Option 2: Heroku (Easiest)

#### 1. Install Heroku CLI

```bash
brew install heroku/brew/heroku  # macOS
# or
curl https://cli-assets.heroku.com/install.sh | sh  # Linux
```

#### 2. Create Heroku App

```bash
heroku create walletwise-app
```

#### 3. Add Python Buildpack

```bash
heroku buildpacks:add --index 1 heroku/python
heroku buildpacks:add --index 2 heroku/nodejs
```

#### 4. Create requirements.txt

```txt
pdfplumber==0.10.2
```

#### 5. Configure Environment Variables

```bash
heroku config:set MONGODB_URI=<your_mongodb_atlas_uri>
heroku config:set JWT_SECRET=<your_secret>
heroku config:set NODE_ENV=production
```

#### 6. Deploy

```bash
git push heroku main
```

#### 7. Open App

```bash
heroku open
```

---

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Deploy Backend to Railway

1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your WalletWise repository
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT=55000`
5. Railway will auto-deploy

#### Deploy Frontend to Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Click "New Project" → Import from GitHub
3. Select WalletWise repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add environment variable:
   - `REACT_APP_API_URL=<your_railway_backend_url>`
6. Deploy

---

### Option 4: AWS EC2 (Production-Grade)

#### 1. Launch EC2 Instance

- **AMI**: Ubuntu 22.04 LTS
- **Instance Type**: t2.medium (recommended)
- **Security Group**: Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 55000 (API)

#### 2. SSH into Instance

```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
```

#### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python and pdfplumber
sudo apt install -y python3 python3-pip
pip3 install pdfplumber

# Install MongoDB (or use MongoDB Atlas)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### 4. Clone and Setup Application

```bash
git clone https://github.com/<your-username>/WalletWise.git
cd WalletWise
npm install
npm run build
```

#### 5. Configure Environment

```bash
# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/financetracker
JWT_SECRET=$(openssl rand -hex 32)
PORT=55000
NODE_ENV=production
EOF
```

#### 6. Setup PM2

```bash
# Start application with PM2
pm2 start server/index.js --name walletwise

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

#### 7. Configure Nginx as Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/walletwise
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /home/ubuntu/WalletWise/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:55000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/walletwise /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/financetracker?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB
brew services start mongodb-community@6.0

# Connection string
mongodb://localhost:27017/financetracker
```

---

## Environment Variables

Create `.env` file in root directory:

```bash
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/financetracker

# Authentication
JWT_SECRET=your_long_random_secret_key_here

# Server
PORT=55000
NODE_ENV=production

# Frontend (for React)
REACT_APP_API_URL=https://your-api-domain.com/api
```

**Generate JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test

    - name: Build
      run: npm run build

    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "walletwise-app"
        heroku_email: "your-email@example.com"
```

---

## Domain Setup

### 1. Purchase Domain
- **Namecheap**, **GoDaddy**, or **Google Domains**

### 2. Configure DNS

**For EC2**:
```
Type: A
Name: @
Value: <ec2-public-ip>
TTL: 3600

Type: A
Name: www
Value: <ec2-public-ip>
TTL: 3600
```

**For Heroku**:
```
Type: CNAME
Name: @
Value: walletwise-app.herokuapp.com
TTL: 3600
```

**For Vercel**:
- Follow Vercel's automatic domain configuration

---

## Performance Optimization

### 1. Enable Gzip Compression

```javascript
// server/index.js
const compression = require('compression');
app.use(compression());
```

### 2. Add Caching Headers

```javascript
app.use(express.static('build', {
  maxAge: '1d',
  etag: true
}));
```

### 3. Database Indexing

```javascript
// Ensure indexes exist
BankStatement.collection.createIndex({ userId: 1, uploadDate: -1 });
User.collection.createIndex({ email: 1 }, { unique: true });
```

### 4. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

---

## Monitoring & Logging

### 1. Setup PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. Error Tracking with Sentry

```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### 3. Application Monitoring

**Options**:
- **New Relic**: Full stack monitoring
- **Datadog**: Infrastructure and APM
- **CloudWatch**: AWS-native monitoring

---

## Backup Strategy

### Database Backups

```bash
# Manual backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/financetracker" --out=/backups/$(date +%Y%m%d)

# Automated daily backups (crontab)
0 2 * * * /usr/bin/mongodump --uri="$MONGODB_URI" --out=/backups/$(date +\%Y\%m\%d)
```

### File Backups

```bash
# Backup uploaded PDFs (if storing locally)
tar -czf walletwise-files-$(date +%Y%m%d).tar.gz /app/uploads
```

---

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Set secure JWT secret (32+ characters)
- [ ] Use environment variables (never commit secrets)
- [ ] Enable MongoDB authentication
- [ ] Whitelist IP addresses in MongoDB Atlas
- [ ] Implement rate limiting
- [ ] Validate and sanitize all inputs
- [ ] Use helmet.js for security headers
- [ ] Keep dependencies updated
- [ ] Regular security audits (`npm audit`)

### Install Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## Cost Estimates

### Free Tier (Development)

- **MongoDB Atlas**: Free tier (512MB)
- **Heroku**: Free dyno (limited hours)
- **Vercel**: Free for hobby projects
- **Railway**: $5/month free credit

**Total: $0-5/month**

### Production (Small Scale)

- **AWS EC2 t2.medium**: ~$30/month
- **MongoDB Atlas M10**: ~$57/month
- **Domain**: ~$12/year
- **SSL**: Free (Let's Encrypt)

**Total: ~$88/month**

### Enterprise (High Scale)

- **AWS EC2 t2.large**: ~$70/month
- **MongoDB Atlas M30**: ~$200/month
- **CloudFront CDN**: ~$20/month
- **Route 53**: ~$1/month

**Total: ~$291/month**

---

## Troubleshooting

### Common Issues

**1. Python script fails**
```bash
# Check Python path
which python3

# Install pdfplumber
pip3 install pdfplumber

# Verify installation
python3 -c "import pdfplumber; print('OK')"
```

**2. MongoDB connection fails**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Test connection
mongo --eval "db.adminCommand('ping')"
```

**3. Port already in use**
```bash
# Find process using port
lsof -i :55000

# Kill process
kill -9 <PID>
```

**4. Out of memory**
```bash
# Increase Node.js memory
node --max-old-space-size=4096 server/index.js
```

---

## Support

For deployment issues:
1. Check logs: `pm2 logs walletwise`
2. Review error messages
3. Check environment variables
4. Verify all dependencies installed
5. Consult platform-specific documentation

---

**Last Updated**: 2025-10-25
**Version**: 1.0
