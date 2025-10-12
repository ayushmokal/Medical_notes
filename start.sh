#!/bin/bash

# Medical Notes System - Quick Start Script
# This script helps you get started quickly

echo "🏥 Medical Notes System - Quick Start"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔥 Firebase Configuration Required"
echo "===================================="
echo ""
echo "Before you can run the app, you need to:"
echo "1. Create a Firebase project at https://console.firebase.google.com/"
echo "2. Enable Authentication (Email/Password)"
echo "3. Create Firestore Database"
echo "4. Enable Storage"
echo "5. Copy your Firebase config"
echo "6. Update src/config/firebase.config.js with your credentials"
echo ""
echo "📖 See SETUP.md for detailed instructions"
echo ""

read -p "Have you configured Firebase? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🚀 Starting development server..."
    echo ""
    npm run dev
else
    echo ""
    echo "👉 Please configure Firebase first, then run:"
    echo "   npm run dev"
    echo ""
fi
