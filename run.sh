#!/bin/bash

# RevenueCat Setup - Entry point for Claude Code skill
# Accepts API key as argument or environment variable

set -e

# Get API key from arguments or environment
API_KEY="${1:-$REVENUECAT_API_KEY}"

if [ -z "$API_KEY" ]; then
  echo "❌ RevenueCat API Key required!"
  echo ""
  echo "Usage:"
  echo "  Export as environment variable:"
  echo "    export REVENUECAT_API_KEY='sk_your_key_here'"
  echo "    /revenuecat-setup"
  echo ""
  echo "  Or pass as argument:"
  echo "    /revenuecat-setup sk_your_key_here"
  echo ""
  echo "Get your API key from:"
  echo "  https://app.revenuecat.com → Project Settings → API Keys"
  exit 1
fi

# Export API key for the Node.js script
export REVENUECAT_API_KEY="$API_KEY"

# Run the setup with auto mode (no prompts)
cd "$(pwd)"
node ~/.claude/skills/revenuecat-setup/dist/index.js --auto
