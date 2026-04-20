#!/bin/bash
# ── PUSH PORTFOLIO TO GITHUB ──
# Run this script once to push your portfolio to GitHub
# Usage: bash push-to-github.sh

echo ""
echo "🚀 Peerace Portfolio — GitHub Setup"
echo "===================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed. Install it from https://git-scm.com"
  exit 1
fi

# Prompt for GitHub username
read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter your repository name (e.g. portfolio): " REPO_NAME

echo ""
echo "📋 Steps:"
echo "  1. Go to https://github.com/new"
echo "  2. Create a NEW repository named: $REPO_NAME"
echo "  3. Set it to PUBLIC"
echo "  4. Do NOT add README (we have one already)"
echo "  5. Click 'Create repository'"
echo ""
read -p "Press ENTER when your GitHub repo is created..."

# Initialize git if not already
if [ ! -d ".git" ]; then
  git init
  echo "✅ Git initialized"
fi

# Add all files
git add .
git commit -m "🚀 Initial portfolio launch — Peerace full-stack portfolio with newsletter system"

# Add remote and push
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
git branch -M main
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🌐 Your repo: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "📌 Next steps:"
echo "  1. Go to Railway (railway.app) or Render (render.com)"
echo "  2. Connect your GitHub repo to deploy the backend"
echo "  3. Add your .env variables in the platform dashboard"
echo "  4. Your portfolio will be live with a public URL!"
echo ""
