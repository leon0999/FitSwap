# 🚀 FitSwap - Million-Scale Food Swap Platform

**Swap Your Food, Not Your Lifestyle**

AI-powered healthy food alternative recommendations for the US market (300M population).

---

## 📊 Project Status

✅ **Phase 1: Core Infrastructure** (COMPLETED)
- Next.js 14 + TypeScript + Turbopack
- Million-scale database schema (Prisma + PostgreSQL)
- 3-layer caching system (Edge + Redis + DB)
- Cost-optimized architecture ($275/month for 100K users)

🚧 **Phase 2: API Integration** (IN PROGRESS)
- Replicate AI food recognition
- USDA FoodData Central integration
- Recommendation algorithm

📋 **Phase 3: Frontend & Payments** (PLANNED)
- Hero page + Upload UI
- Stripe subscription system
- User dashboard

---

## 💰 Cost Optimization: Pro vs Amateur

| Service | Amateur | Professional (Us) | **Monthly Savings** |
|---------|---------|-------------------|---------------------|
| AI Recognition | OpenAI $12,750 | Replicate $200 | **$12,550** |
| Nutrition API | Nutritionix $299 | USDA Free | **$299** |
| Image Storage | Self-hosted $500 | Cloudflare $50 | **$450** |
| Database | Managed $200 | Supabase $25 | **$175** |
| Redis | Managed $100 | Upstash Free | **$100** |
| **TOTAL** | **$13,849** | **$275** | **$13,574** 🎉 |

**Annual Savings: $162,888**

---

## 🔧 Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Setup database
npx prisma generate
npx prisma db push

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Essential Environment Variables

```bash
DATABASE_URL="postgresql://..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
REPLICATE_API_TOKEN="r8_..."
USDA_API_KEY="..."
```

See `.env.example` for complete list.

---

## 🚀 Performance Targets

- **First Contentful Paint**: < 0.8s
- **Time to Interactive**: < 2.0s
- **API Response (p95)**: < 150ms
- **Cache Hit Rate**: > 99%
- **Uptime**: 99.99%

---

## 📈 Business Goals

### Month 1
- **Traffic**: 25,000 visitors
- **Signups**: 700
- **Premium**: 37 subscribers ($9.99/mo)
- **MRR**: $370

### Month 3
- **MAU**: 10,000
- **Premium**: 200 subscribers
- **MRR**: $2,000
- **Status**: Break-even achieved

---

**Made with ❤️ for healthier eating** 🥗

**Target: 300M Americans** 🇺🇸
