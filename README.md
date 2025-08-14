# Store App

## Requirements

Before getting started, make sure you have the following installed:

- **Node.js**: version `22.13.0`
- **PostgreSQL**

## Installation

1. Clone the repository:

```bash
git clone git@github.com:ravnhq/BE-Nerdery-Week5-Challenge.git
```

2. Install dependencies

```bash
npm i
```

3. Create the .env file with your credentials

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database"
SECRET="SECRET"
SECRET_KEY="SECRET_KEY"
```

4. Generate Prisma Schema:

```bash
npx prisma generate
```

If you are using an unexisting database use this command to create the database and migrate Prisma:

```bash
npx prisma migrate dev --name init
```

## Running the app

```bash
npm run dev
```

## Mocking Data

```bash
npx prisma db seed
```

this will create two user in prisma/seed.ts:

```bash
[
    {
        name: 'Alice',
        email: 'alice@example.com',
        password: '1234',
        role: 'user'
    },
    {
        name: 'Bob',
        email: 'bob@example.com',
        password: 'password',
        role: 'admin'
    }
]
```
