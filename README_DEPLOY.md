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

## Recommended production database
Use PostgreSQL for production. Render PostgreSQL is recommended and works well with Prisma.

## Render deployment
1. Create a PostgreSQL database on Render.
2. Create a web service for this project.
3. Connect the web service to the database using the generated connection string.
4. Set the environment variables:
   - DATABASE_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - JWT_SECRET
   - NEXT_PUBLIC_ADMIN_PASSWORD
   - ADMIN_PASSWORD

A Render blueprint file is included as [render.yaml](render.yaml).
