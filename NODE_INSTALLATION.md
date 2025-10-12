# Node.js Installation Guide for macOS

## ✅ What We Just Did

1. **Installed Homebrew** (macOS package manager)
2. **Configured Homebrew** in your shell
3. **Installing Node.js** (in progress)

## 📋 Installation Steps Completed

### Step 1: Homebrew Installation ✅
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Add Homebrew to PATH ✅
```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
```

### Step 3: Install Node.js ⏳ (Currently Running)
```bash
brew install node
```

## ⏳ Next Steps (After Node.js Installation Completes)

### 1. Verify Installation
Once the installation completes, run:
```bash
node --version
npm --version
```

You should see version numbers like:
```
v20.x.x  (or similar)
10.x.x   (or similar)
```

### 2. Install Project Dependencies
```bash
cd /Users/ayushmokal/Documents/Medical_notes
npm install
```

This will install all the dependencies listed in `package.json`:
- React 18
- Firebase
- tldraw
- Tesseract.js
- And more...

### 3. Configure Firebase
Before running the app, you need to:
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Authentication, Firestore, and Storage
4. Copy your Firebase credentials
5. Update `src/config/firebase.config.js`

See **SETUP.md** for detailed Firebase setup instructions.

### 4. Run the Application
```bash
npm run dev
```

## 🐛 Troubleshooting

### If `npm install` fails:
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

### If you see permission errors:
```bash
# Fix npm permissions
sudo chown -R $USER /usr/local/lib/node_modules
```

### If Homebrew commands don't work after restart:
```bash
# Make sure this line is in your ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile

# Reload your shell
source ~/.zprofile
```

## 📊 What Node.js Installation Includes

- **Node.js**: JavaScript runtime
- **npm**: Package manager (used to install project dependencies)
- **npx**: Package runner

## 🎯 Current Status

- ✅ Homebrew installed
- ✅ Homebrew configured in PATH
- ⏳ Node.js installation in progress
- ⏸️ Project dependencies (waiting for Node.js)
- ⏸️ Firebase configuration
- ⏸️ Run application

## 📝 After Everything is Set Up

You'll be able to:
1. Install project dependencies with `npm install`
2. Run development server with `npm run dev`
3. Build for production with `npm run build`
4. Deploy to Firebase with `firebase deploy`

## ⏰ Estimated Time

- Node.js installation: 5-10 minutes (depending on internet speed)
- Project dependencies: 2-3 minutes
- Firebase setup: 5-10 minutes (manual configuration)
- Total: ~15-25 minutes

## 🔗 Useful Links

- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [Homebrew Documentation](https://docs.brew.sh/)

## 💡 Pro Tips

1. **Keep Node.js Updated**
   ```bash
   brew upgrade node
   ```

2. **Check Installed Packages**
   ```bash
   npm list --depth=0
   ```

3. **Clear Cache if Issues Arise**
   ```bash
   npm cache clean --force
   ```

4. **Use Node Version Manager (optional)**
   If you need multiple Node versions:
   ```bash
   brew install nvm
   ```

## 🎉 Once Node.js is Installed

Run these commands in order:
```bash
# 1. Verify installation
node --version
npm --version

# 2. Navigate to project
cd /Users/ayushmokal/Documents/Medical_notes

# 3. Install dependencies
npm install

# 4. Read setup guide
cat SETUP.md

# 5. Configure Firebase (manual step - see SETUP.md)

# 6. Run the app
npm run dev
```

---

**Current Step**: Waiting for Node.js installation to complete...

**Next**: Once you see "🍺 node x.x.x is successfully installed!" in the terminal, proceed with `npm install`
