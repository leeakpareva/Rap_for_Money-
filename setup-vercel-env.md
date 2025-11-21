# Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables to your Vercel project:

### 1. Database Configuration
```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/rap-for-money
```
Replace with your actual MongoDB connection string.

### 2. Authentication
```
JWT_SECRET=your-super-secret-jwt-key-here-change-this
```
Generate a secure random string. You can use: `openssl rand -base64 32`

### 3. Application URLs
```
CLIENT_URL=https://your-app-name.vercel.app
```
This will be your Vercel deployment URL.

### 4. Environment
```
NODE_ENV=production
```

## How to Add via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project "Rap_for_Money-"
3. Go to Settings → Environment Variables
4. Add each variable above
5. Click "Save"

## How to Add via Vercel CLI (After Login)

Once you're logged in to Vercel CLI, you can add environment variables using:

```bash
# First, link your project
npx vercel link

# Then add environment variables
npx vercel env add MONGODB_URI production
npx vercel env add JWT_SECRET production
npx vercel env add CLIENT_URL production
npx vercel env add NODE_ENV production
```

## Sample Values for Testing

If you need a MongoDB for testing, you can:
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Use a local MongoDB: `mongodb://localhost:27017/rap-for-money`

For JWT_SECRET, here's a generated one (CHANGE THIS):
```
JWT_SECRET=2a8f9b7c3d5e1f4g6h8j2k9l0m3n5p7q
```

## Deploy Command

After setting up environment variables:
```bash
npx vercel --prod
```