# Korean Language Learning App

AI-based interactive Korean language learning application for Malaysia users.

## Features

- **Interactive Learning**: Practice Korean conversation with AI
- **Games**: Typing and speaking games with 10 levels each
- **Level Test**: AI-powered proficiency assessment
- **Curriculum Management**: AI-generated and document-based curricula
- **Multi-language Support**: English, Malay, Korean
- **Responsive Design**: Mobile, tablet, and desktop optimized

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- PostgreSQL (Prisma ORM)
- AI APIs: OpenAI (primary), Google Gemini (fallback 1), Claude (fallback 2)
- Tailwind CSS
- next-intl

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Random secret for sessions
- `OPENAI_API_KEY`: OpenAI API key
- `GOOGLE_GEMINI_API_KEY`: Google Gemini API key
- `ANTHROPIC_API_KEY`: Anthropic Claude API key

3. Set up database:
```bash
npx prisma migrate dev
```

4. Run development server:
```bash
npm run dev
```

5. Create admin user (optional):
```bash
npm run create-admin
```

6. Seed sample documents (optional):
```bash
npm run seed-docs
```

7. Verify database schema:
```bash
npm run verify-schema
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run create-admin` - Create admin user
- `npm run seed-docs` - Seed sample documents
- `npm run verify-schema` - Verify database schema

## Deployment

### Azure Deployment

1. Create Azure resources:
   - Azure Container Registry (ACR)
   - Azure App Service (Linux, Container)
   - Azure PostgreSQL

2. Configure GitHub Secrets:
   - `ACR_LOGIN_SERVER`
   - `ACR_USERNAME`
   - `ACR_PASSWORD`
   - `AZURE_APP_SERVICE_NAME`

3. Push to main branch to trigger deployment

## Project Structure

```
korean-learning-app/
├── app/
│   ├── [locale]/          # Internationalized routes
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and helpers
├── prisma/               # Database schema
└── public/               # Static files
```

## License

Private
