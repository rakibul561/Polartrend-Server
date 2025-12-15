# PolarTrend - Reddit Trend Discovery Platform

## 📖 Overview

PolarTrend is a trend aggregation platform that helps users discover emerging topics from Reddit before they go mainstream. Built for social media influencers, entrepreneurs, and early adopters who want to stay ahead of the curve.

## 🚀 Tech Stack

- **Backend Framework:** Node.js + Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **API Style:** RESTful API
- **Authentication:** JWT-based auth with role-based access control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd polartrend-backend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/polartrend?schema=public"

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (for authentication)
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Reddit API (if integrated)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 5. Start Development Server

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

## 📁 Project Structure

```
polartrend-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding script
├── src/
│   ├── modules/
│   │   ├── trend/
│   │   │   ├── trend.controller.ts
│   │   │   ├── trend.service.ts
│   │   │   ├── trend.routes.ts
│   │   │   └── trend.validation.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   └── userConstance.ts
│   │   └── auth/
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       └── auth.routes.ts
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── rateLimiter.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   ├── config/
│   │   └── database.ts
│   └── server.ts                # Application entry point
├── tests/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### Core Tables

#### User
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  name          String?
  role          UserRole  @default(USER)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

#### Trend
```prisma
model Trend {
  id              String               @id @default(uuid())
  title           String               @unique
  slug            String               @unique
  description     String?

  mentions24h     Int                  # Reddit mentions in last 24h
  historicalCount Int                  # Total historical mentions

  maturityStage   TrendMaturityStage   # Current lifecycle stage
  accuracyStatus  PredictionAccuracy   # Prediction status

  firstDetectedAt DateTime
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  redditMentions    RedditMention[]
  historySnapshots  TrendHistory[]
  similarTrendsFrom SimilarTrend[]     @relation("from")
  similarTrendsTo   SimilarTrend[]     @relation("to")
}
```

#### RedditMention
```prisma
model RedditMention {
  id          String   @id @default(uuid())
  trendId     String

  subreddit   String
  postTitle   String
  postUrl     String   
  mentionedAt DateTime

  trend       Trend    @relation(fields: [trendId], references: [id], onDelete: Cascade)
}
```

#### RedditCandidateMention
```prisma
model RedditCandidateMention {
  id          String   @id @default(uuid())

  candidate   String   # Potential trend keyword
  subreddit   String
  postTitle   String
  postUrl     String   @unique
  mentionedAt DateTime

  createdAt   DateTime @default(now())
}
```

#### TrendHistory
```prisma
model TrendHistory {
  id             String               @id @default(uuid())
  trendId        String

  snapshotDate   DateTime
  mentions24h    Int
  maturityStage  TrendMaturityStage
  accuracyStatus PredictionAccuracy

  trend          Trend                @relation(fields: [trendId], references: [id], onDelete: Cascade)

  @@unique([trendId, snapshotDate])
}
```

#### SimilarTrend
```prisma
model SimilarTrend {
  id              String @id @default(uuid())

  fromTrendId     String
  toTrendId       String

  similarityScore Float

  fromTrend Trend @relation("from", fields: [fromTrendId], references: [id], onDelete: Cascade)
  toTrend   Trend @relation("to", fields: [toTrendId], references: [id], onDelete: Cascade)

  @@unique([fromTrendId, toTrendId])
}
```

### Enums

```prisma
enum TrendMaturityStage {
  DISCOVERY           # Just detected, very early stage
  POLAR_TREND         # Confirmed polar trend
  EARLY_MAINSTREAM    # Starting to go mainstream
  SATURATION          # Fully mainstream/saturated
}

enum PredictionAccuracy {
  TOO_EARLY           # Just added, too early to predict
  RISING              # Trend is rising as predicted
  EXPLODING           # Trend exploded - correct prediction
}

enum UserRole {
  ADMIN               # Full access including create/update/delete
  USER                # Read-only access
}
```

## 🔌 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "securePassword123"
}
Response: {
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Trends

#### Get Platform Statistics
```http
GET /api/trends/stats
Response: {
  "totalTrends": number,
  "trendsByStage": {...},
  "accuratePredicitions": number,
  ...
}
```

#### Get Trending Now
```http
GET /api/trends/trending
Query Parameters:
  - limit: number (default: 10)
Response: Top trending topics based on recent activity
```

#### Search Trends
```http
GET /api/trends/search
Query Parameters:
  - q: string (search query)
  - limit: number (default: 20)
```

#### Get Trends from 1 Month Ago (Fast Forward)
```http
GET /api/trends/fast-forward/month
Description: Shows trends that were added exactly 30 days ago with their current status
Response: Array of trends with prediction accuracy
```

#### Get All Trends with Filters
```http
GET /api/trends
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - maturityStage: DISCOVERY | POLAR_TREND | EARLY_MAINSTREAM | SATURATION
  - accuracyStatus: TOO_EARLY | RISING | EXPLODING
  - sortBy: 'createdAt' | 'mentions24h' | 'firstDetectedAt'
  - order: 'asc' | 'desc' (default: 'desc')
```

#### Get Single Trend
```http
GET /api/trends/:id
Response: {
  "id": "uuid",
  "title": "string",
  "slug": "string",
  "description": "string",
  "mentions24h": number,
  "historicalCount": number,
  "maturityStage": "POLAR_TREND",
  "accuracyStatus": "RISING",
  "redditMentions": [...],
  "historySnapshots": [...],
  ...
}
```

#### Get Similar Trends
```http
GET /api/trends/:id/similar
Query Parameters:
  - limit: number (default: 5)
Response: Array of similar trends with similarity scores
```

#### Create New Trend (Admin Only)
```http
POST /api/trends
Headers: Authorization: Bearer <token>
Body: {
  "title": "string",
  "description": "string",
  "mentions24h": number,
  "historicalCount": number,
  "maturityStage": "POLAR_TREND",
  "accuracyStatus": "TOO_EARLY",
  "redditMentions": [
    {
      "subreddit": "string",
      "postTitle": "string",
      "postUrl": "string",
      "mentionedAt": "ISO8601 date"
    }
  ]
}
```

#### Update Trend (Admin Only)
```http
PUT /api/trends/:id
Headers: Authorization: Bearer <token>
Body: Partial trend data to update
```

#### Delete Trend (Admin Only)
```http
DELETE /api/trends/:id
Headers: Authorization: Bearer <token>
```

#### Add Reddit Mentions to Trend
```http
POST /api/trends/:id/mentions
Body: {
  "mentions": [
    {
      "subreddit": "string",
      "postTitle": "string",
      "postUrl": "string",
      "mentionedAt": "ISO8601 date"
    }
  ]
}
```

#### Rebuild All Similar Trends
```http
POST /api/trends/rebuild-similar
Description: Recalculates similarity scores for all trends
Note: This may be a heavy operation
```

## 🔐 Authentication & Authorization

The API uses JWT-based authentication with role-based access control.

### Protected Routes

Routes that require authentication use the `auth()` middleware:

```typescript
// Admin only routes
router.put("/:id", auth(UserRole.ADMIN), TrendController.updateTrend);
router.delete("/:id", auth(UserRole.ADMIN), TrendController.deleteTrend);
```

### Using Authentication

1. **Register or Login** to get JWT token
2. **Include token** in request headers:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

### User Roles

- **ADMIN**: Full access (create, read, update, delete)
- **USER**: Read-only access (view trends and statistics)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Prisma commands
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed database
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Update `DATABASE_URL` with production database
   - Set strong `JWT_SECRET` (use a random string generator)
   - Configure `ALLOWED_ORIGINS` for your frontend domain
   - Set `NODE_ENV=production`

2. **Database**
   ```bash
   # Run migrations on production
   npx prisma migrate deploy
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Server**
   ```bash
   npm start
   ```

### Deployment Platforms

#### Heroku
```bash
heroku create polartrend-api
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your_secret_here
git push heroku main
heroku run npx prisma migrate deploy
```

#### Railway
```bash
railway login
railway init
railway add
railway up
```

#### DigitalOcean App Platform
- Connect GitHub repository
- Add PostgreSQL database
- Set environment variables
- Configure build and run commands

#### Render
- Connect GitHub repository
- Add PostgreSQL database
- Set environment variables:
  - `DATABASE_URL` (auto-provided by Render)
  - `JWT_SECRET`
  - `NODE_ENV=production`
- Build command: `npm install && npx prisma generate && npm run build`
- Start command: `npm start`

## 🔐 Security Best Practices

- ✅ JWT-based authentication implemented
- ✅ Role-based access control (RBAC)
- ✅ Password hashing (use bcrypt)
- ✅ Input validation and sanitization
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Environment variable usage
- ✅ SQL injection protection (Prisma ORM)
- ⚠️ Enable HTTPS in production
- ⚠️ Use helmet.js for security headers
- ⚠️ Implement refresh tokens for long sessions

## 📊 Key Features

### Trend Lifecycle Tracking
- **DISCOVERY**: Just detected, very early stage
- **POLAR_TREND**: Confirmed polar trend with Reddit traction
- **EARLY_MAINSTREAM**: Starting to spread to other platforms
- **SATURATION**: Fully mainstream/oversaturated

### Prediction Accuracy System
- **TOO_EARLY**: Just added, too early to assess
- **RISING**: Trend is growing as predicted
- **EXPLODING**: Trend has exploded - prediction was correct

### Similar Trends Algorithm
- Automatic similarity calculation between trends
- Helps users discover related topics
- Rebuild functionality for recalculating similarities

### Historical Tracking
- TrendHistory model tracks snapshots over time
- Enables "1-month fast forward" feature
- Shows prediction accuracy over time

## 📈 Database Relationships

```
User (1) ─────────────────────────────────────────> (N/A)
                                                     (Auth only)

Trend (1) ────< RedditMention (N)
Trend (1) ────< TrendHistory (N)
Trend (1) ────< SimilarTrend (N) >────> Trend (1)

RedditCandidateMention (standalone table for potential trends)
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend Development:** Rakibul Hasan
- **Database Architecture:** Rakibul Hasan
- **API Design:** Rakibul Hasan

## 📞 Support

For support, email rakibulhasan3929@gmail.com or join our Discord server.

## 🔗 Related Links

- Frontend Repository: [Link to frontend repo]
- Partner Site: [Radiofication.com](https://radiofication.com)
- API Documentation: [Link to Swagger/Postman docs]

## 📈 Roadmap
- [x] Core API development
- [x] Database schema design
- [x] JWT authentication
- [x] Role-based access control
- [x] Trend lifecycle tracking
- [x] Similar trends algorithm
- [x] Historical snapshots
- [x] Fast-forward feature
- [ ] Reddit API integration
- [ ] Real-time trend updates (WebSockets)
- [ ] Advanced analytics dashboard
- [ ] Machine learning predictions
- [ ] Email notifications
- [ ] Export functionality (CSV, JSON)
- [ ] Rate limiting per user
- [ ] API documentation (Swagger)

## 🙏 Acknowledgments
- Reddit API for trend data
- Prisma ORM for excellent database tooling
- Express.js community
- All contributors and testers

---

**Made with ❤️ for trend hunters worldwide**