import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createUsers() {
  try {
    await prisma.user.createMany({
      data: [
        { name: 'Alice', email: 'alice@example.com', password: await bcrypt.hash('1234', 10), role: 'user' },
        { name: 'Bob', email: 'bob@example.com', password: await bcrypt.hash('password', 10), role: 'admin' },
      ],
      skipDuplicates: true,
    });

    console.log('Database seeded successfully!');
  } catch (e) {
    console.error('Error seeding database:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();