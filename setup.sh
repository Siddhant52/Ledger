#!/bin/bash
set -e

echo "🚀 Setting up Ledger v2 Finance Tracker..."
echo ""

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate

# 3. Push schema to database (creates tables)
echo "🗄️  Pushing Prisma schema to Supabase..."
npx prisma db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "👉 Run the app with:  npm run dev"
echo "👉 Open in browser:   http://localhost:3000"
echo ""
echo "📊 Optional: View your DB in Prisma Studio:  npx prisma studio"
