import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@y-gym.io',
        password: 'password123',
        role: 'MEMBER'
      }
    });

    console.log('Created test user:', user);

    // Create a test metric for this user
    const metric = await prisma.userMetric.create({
      data: {
        userId: user.id,
        key: 'weight',
        value: 75.5,
        unit: 'kg',
        notes: 'Initial weight',
        recordedAt: new Date()
      }
    });

    console.log('Created test metric:', metric);
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
