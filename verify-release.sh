#!/bin/bash
# Vatevo v0.1.0 Release Verification Script
# Run this after completing DNS configuration

echo "🔍 Vatevo v0.1.0 Release Verification"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the vatEvo root directory"
    exit 1
fi

echo "📋 Current deployment info:"
echo "   Commit: a472441"
echo "   Build Time: 2025-09-08T22:02:20Z"
echo "   Expected Footer Stamp: 2025-09-08T22:02:20Z • a472441"
echo ""

echo "🌐 DNS & SSL Verification"
echo "========================="

# DNS checks
echo "DNS Records:"
echo "  vatevo.com:"
dig +short A vatevo.com
echo "  www.vatevo.com:"
dig +short CNAME www.vatevo.com
echo "  dashboard.vatevo.com:"
dig +short CNAME dashboard.vatevo.com
echo "  docs.vatevo.com:"
dig +short CNAME docs.vatevo.com
echo ""

# HTTP status checks
echo "HTTP Status Checks:"
echo "  vatevo.com:"
curl -I -sS https://vatevo.com | sed -n '1,6p'
echo ""
echo "  www.vatevo.com:"
curl -I -sS https://www.vatevo.com | sed -n '1,6p'
echo ""
echo "  dashboard.vatevo.com:"
curl -I -sS https://dashboard.vatevo.com | sed -n '1,6p'
echo ""
echo "  docs.vatevo.com:"
curl -I -sS https://docs.vatevo.com | sed -n '1,6p'
echo ""
echo "  api.vatevo.com/healthz:"
curl -I -sS https://api.vatevo.com/healthz | sed -n '1,6p'
echo ""

echo "🎯 Manual Checks Required:"
echo "========================="
echo "1. Open https://vatevo.com/vida and verify footer shows: 2025-09-08T22:02:20Z • a472441"
echo "2. Open https://vatevo.com/compare and verify footer shows: 2025-09-08T22:02:20Z • a472441"
echo "3. Verify https://www.vatevo.com redirects to https://vatevo.com"
echo "4. Check all pages load correctly: /vida, /compare, /solutions"
echo ""

echo "✅ If all checks pass, update RELEASE_NOTES.md with:"
echo "   - Domains: ✅ (when DNS/curl OK)"
echo "   - SSL: ✅ (when Vercel and Fly show Ready)"
echo "   - Final production URL: https://vatevo.com"
