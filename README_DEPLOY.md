# Deployment Notes

## Build
Run:

```bash
npm install
npx prisma generate
npm run build
```

## Start
Run:

```bash
npm run start -- --hostname 0.0.0.0 --port 3000
```

## Environment variables
Set these in your hosting provider:

- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- JWT_SECRET
- NEXT_PUBLIC_ADMIN_PASSWORD
- ADMIN_PASSWORD
- NEXT_PUBLIC_SUPABASE_URL (optional)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (optional)

## Recommended production database
Use Supabase PostgreSQL for production. Supabase works well with Prisma and Vercel deployments.

## Vercel + Supabase deployment
1. Create a Supabase project.
2. Copy the PostgreSQL connection string from Supabase.
3. Set `DATABASE_URL` in Vercel to the Supabase PostgreSQL connection string.
4. Set the remaining environment variables in Vercel:
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - JWT_SECRET
   - NEXT_PUBLIC_ADMIN_PASSWORD
   - ADMIN_PASSWORD
5. Use the following build command:
   - `npm install && npx prisma generate && npm run build`
6. Use the following start command:
   - `npx prisma migrate deploy && npm run start -- --hostname 0.0.0.0 --port $PORT`

## Local development
For local development, keep `DATABASE_URL` pointed to your local PostgreSQL instance or your Supabase connection string.
