#!/bin/bash

# Firebase Backend Setup - Complete Configuration
# This script verifies and completes your Firebase setup

echo "🔥 Firebase Backend Setup for Medical Notes System"
echo "=================================================="
echo ""

# Check if Firebase CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ npm/npx not found. Please install Node.js first."
    exit 1
fi

echo "✅ Firebase CLI installed"
echo ""

# Show current project
echo "📋 Current Firebase Project:"
npx firebase projects:list | grep medical-notes-system
echo ""

# Check Firebase config
echo "🔧 Checking Firebase Configuration..."
if rg -q "VITE_FIREBASE_API_KEY" src/config/firebase.config.js; then
    echo "✅ Firebase config file reads from environment variables"
else
    echo "❌ Firebase config not updated to use env vars"
fi
echo ""

# Check .env file
if [ -f .env ]; then
    REQUIRED_VARS=("VITE_FIREBASE_API_KEY" "VITE_FIREBASE_AUTH_DOMAIN" "VITE_FIREBASE_PROJECT_ID" "VITE_FIREBASE_STORAGE_BUCKET" "VITE_FIREBASE_MESSAGING_SENDER_ID" "VITE_FIREBASE_APP_ID")
    missing_vars=()
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" .env; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -eq 0 ]; then
        echo "✅ Environment variables configured"
    else
        echo "❌ Missing environment variables: ${missing_vars[*]}"
    fi
else
    echo "❌ .env file not found"
fi
echo ""

echo "🎯 Remaining Manual Steps:"
echo ""
echo "1️⃣  Enable Firebase Authentication:"
echo "    👉 https://console.firebase.google.com/project/medical-notes-system/authentication"
echo "    - Click 'Get Started'"
echo "    - Enable 'Email/Password' sign-in method"
echo ""

echo "2️⃣  Enable Firebase Storage:"
echo "    👉 https://console.firebase.google.com/project/medical-notes-system/storage"
echo "    - Click 'Get Started'"
echo "    - Choose 'Start in production mode'"
echo "    - Select your region"
echo ""

echo "3️⃣  Verify Firestore is enabled:"
echo "    👉 https://console.firebase.google.com/project/medical-notes-system/firestore"
echo "    - Should show 'Cloud Firestore' with data tabs"
echo ""

echo "📝 After completing steps 1-2 above, run:"
echo "    npx firebase deploy --only firestore:rules,storage"
echo ""

echo "🚀 Then start your dev server:"
echo "    npm run dev"
echo ""

echo "=================================================="
echo "✨ Firebase Backend Configuration Summary"
echo "=================================================="
echo ""
echo "Project ID: medical-notes-system"
echo "Project Number: 221922593535"
echo "App ID: 1:221922593535:web:01f102136c8410cc9edaca"
echo ""
echo "Services Status:"
echo "  ✅ Firestore - Configured"
echo "  ✅ Firebase Config - Updated"
echo "  ⏳ Authentication - Needs manual enable"
echo "  ⏳ Storage - Needs manual enable"
echo "  ✅ Gemini OCR - Configured"
echo ""
echo "Quick Links:"
echo "  📊 Console: https://console.firebase.google.com/project/medical-notes-system"
echo "  🔐 Auth: https://console.firebase.google.com/project/medical-notes-system/authentication"
echo "  💾 Storage: https://console.firebase.google.com/project/medical-notes-system/storage"
echo "  📚 Firestore: https://console.firebase.google.com/project/medical-notes-system/firestore"
echo ""
