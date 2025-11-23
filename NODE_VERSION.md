# ⚠️ Node.js Version Requirement

## Current Issue

Your current Node.js version is **v12.9.1**, which is too old for this project.

## Required Version

This project requires **Node.js 18.17.0 or higher** (Node.js 20+ recommended).

## How to Update Node.js

### Option 1: Download from Official Website
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version (recommended: v20.x or v18.x)
3. Install and restart your terminal

### Option 2: Using nvm (Node Version Manager) - Recommended

**Windows:**
1. Install nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
2. Open a new terminal and run:
   ```bash
   nvm install 20
   nvm use 20
   ```

**Mac/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 20
nvm install 20
nvm use 20
```

## After Updating Node.js

1. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   # or on Windows:
   rmdir /s node_modules
   del package-lock.json
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Set up database:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Verify Your Node Version

After updating, verify with:
```bash
node --version
```

You should see v18.x.x or v20.x.x

