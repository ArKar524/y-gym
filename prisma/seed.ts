import { PrismaClient, Prisma } from '../src/app/generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Alice',
    email: 'alice@y-gym.io',
    address: '123 Fitness Ave, Gymtown',
    phone: '+1 (555) 123-4567',
    imageUrl: 'https://randomuser.me/api/portraits/women/42.jpg',
    role: 'ADMIN',
    password: 'password',
    activityLogs: {
      create: [
        {
          data: {
            weight: 68.5,
            calories: 2000,
            heartRate: 76,
          },
        },
      ],
    },
    plans: {
      create: [
        {
          title: 'Morning Routine',
          date: new Date(),
          details: [
            { time: '06:30', exercise: 'Jogging' },
            { time: '07:00', exercise: 'Plank' },
          ],
        },
      ],
    },
    payments: {
      create: [
        {
          amount: 50,
          method: 'CARD',
          transactionRef: 'txn_alice_001',
        },
      ],
    },
  },
  {
    name: 'Bob',
    email: 'bob@y-gym.io',
    address: '456 Muscle St, Gymtown',
    phone: '+1 (555) 987-6543',
    imageUrl: 'https://randomuser.me/api/portraits/men/37.jpg',
    role: 'MEMBER',
    password: 'password',
    activityLogs: {
      create: [
        {
          data: {
            weight: 82,
            calories: 2300,
            sleepHours: 6,
          },
        },
      ],
    },
    plans: {
      create: [
        {
          title: 'Evening Burn',
          date: new Date(),
          details: [
            { time: '18:00', exercise: 'Cycling' },
            { time: '18:30', exercise: 'Push-ups' },
          ],
        },
      ],
    },
    payments: {
      create: [
        {
          amount: 45,
          method: 'PAYPAL',
          transactionRef: 'txn_bob_001',
        },
      ],
    },
  },
]

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u })
  }
}
main()
