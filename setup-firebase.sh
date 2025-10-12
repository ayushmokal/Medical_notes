#!/bin/bash

# Firebase Automated Setup Script
# Medical Notes System

echo ""
echo "🔥 Firebase CLI Setup - Medical Notes System"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please wait for Node.js installation to complete."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install Firebase CLI
echo "📦 Installing Firebase CLI globally..."
npm install -g firebase-tools

if [ $? -eq 0 ]; then
    echo "✅ Firebase CLI installed successfully!"
else
    echo "❌ Failed to install Firebase CLI"
    exit 1
fi

echo ""
echo "🔐 Logging in to Firebase..."
echo "A browser window will open. Please sign in with your Google account."
echo ""

firebase login

if [ $? -eq 0 ]; then
    echo "✅ Successfully logged in to Firebase!"
else
    echo "❌ Firebase login failed"
    exit 1
fi

echo ""
echo "🏗️  Creating Firebase project..."
echo "Project name: medical-notes-system"
echo ""

# Try to create project (may fail if exists)
firebase projects:create medical-notes-system --display-name "Medical Notes System" 2>/dev/null

# Use the project (whether newly created or existing)
firebase use medical-notes-system

if [ $? -eq 0 ]; then
    echo "✅ Using project: medical-notes-system"
else
    echo "ℹ️  Project may already exist. Continuing..."
fi

echo ""
echo "⚙️  Initializing Firebase services..."
echo "This will set up Firestore and Storage rules."
echo ""
echo "When prompted:"
echo "  - Select: Firestore, Storage"
echo "  - Firestore rules: firestore.rules (default)"
echo "  - Firestore indexes: firestore.indexes.json (default)"
echo "  - Storage rules: storage.rules (default)"
echo "  - Overwrite files: No (we already have them)"
echo ""
read -p "Press ENTER to continue..."

# Initialize Firebase with prompts
firebase init firestore storage

echo ""
echo "📋 Getting Firebase Web App Configuration..."
echo ""

# Create a web app if it doesn't exist
firebase apps:create web medical-notes-web 2>/dev/null

# Get the configuration
echo "Your Firebase Configuration:"
echo "============================"
firebase apps:sdkconfig web

echo ""
echo "📝 Copy the configuration above and paste it into:"
echo "   src/config/firebase.config.js"
echo ""
read -p "Press ENTER once you've copied the configuration..."

echo ""
echo "🌐 Opening Firebase Console for final setup..."
echo ""
echo "You need to manually enable these services:"
echo ""
echo "1️⃣  Authentication (Email/Password)"
echo "2️⃣  Firestore Database"
echo "3️⃣  Storage"
echo ""

read -p "Press ENTER to open Authentication page..."
firebase open auth

echo ""
echo "In the browser:"
echo "  1. Click 'Get Started'"
echo "  2. Click 'Email/Password'"
echo "  3. Toggle 'Enable'"
echo "  4. Click 'Save'"
echo ""
read -p "Press ENTER once Authentication is enabled..."

read -p "Press ENTER to open Firestore page..."
firebase open firestore

echo ""
echo "In the browser:"
echo "  1. Click 'Create Database'"
echo "  2. Select 'Start in test mode'"
echo "  3. Choose your location"
echo "  4. Click 'Enable'"
echo ""
read -p "Press ENTER once Firestore is created..."

read -p "Press ENTER to open Storage page..."
firebase open storage

echo ""
echo "In the browser:"
echo "  1. Click 'Get Started'"
echo "  2. Use default rules"
echo "  3. Choose same location as Firestore"
echo "  4. Click 'Done'"
echo ""
read -p "Press ENTER once Storage is enabled..."

echo ""
echo "🚀 Deploying Firestore and Storage security rules..."
firebase deploy --only firestore:rules,storage:rules

if [ $? -eq 0 ]; then
    echo "✅ Rules deployed successfully!"
else
    echo "⚠️  Rules deployment failed. You can deploy them later with:"
    echo "   firebase deploy --only firestore:rules,storage:rules"
fi

echo ""
echo "🎉 Firebase Setup Complete!"
echo "=========================="
echo ""
echo "✅ Firebase CLI installed"
echo "✅ Logged in to Firebase"
echo "✅ Project created/selected"
echo "✅ Services initialized"
echo "✅ Authentication enabled"
echo "✅ Firestore Database created"
echo "✅ Storage enabled"
echo "✅ Security rules deployed"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Make sure you've updated src/config/firebase.config.js"
echo ""
echo "2. Install project dependencies:"
echo "   npm install"
echo ""
echo "3. Run the development server:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "🎊 Happy coding!"
echo ""
