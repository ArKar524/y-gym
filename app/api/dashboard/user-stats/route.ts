import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

type WorkoutDetails = {
  type?: string;
  caloriesBurned?: number;
  exercises?: Array<{
    name: string;
    sets?: number;
    reps?: number;
  }>;
  description?: string;
};

export async function GET() {
  try {
    // Get current user from auth
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user metrics
    const latestMetrics = await prisma.userMetric.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        recordedAt: 'desc',
      },
      take: 10,
    });

    // Get user's workouts
    const workouts = await prisma.dailyPlan.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        date: 'desc',
      },
      take: 5,
    });
    
    // Filter workouts based on details.type if needed
    const filteredWorkouts = workouts.filter(workout => {
      try {
        const details = workout.details as any;
        return details?.type === 'WORKOUT';
      } catch {
        return false;
      }
    });

    // Get user's payments
    const payments = await prisma.payment.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        program: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    // Calculate workout streak (simplified version)
    // In a real app, you would have more sophisticated logic
    const workoutDates = filteredWorkouts.map(w => w.date.toISOString().split('T')[0]);
    const uniqueDates = [...new Set(workoutDates)];
    const workoutStreak = uniqueDates.length;

    // Calculate health score based on metrics (simplified version)
    // In a real app, you would have more sophisticated logic
    const healthScore = 75; // Base score
    
    // Find latest weight metric if exists - can be used for more sophisticated health score calculation
    // const latestWeight = latestMetrics.find(m => m.key === 'WEIGHT');
    // Commented out since it's not being used yet
    
    // Calculate calories burned (simplified version)
    // In a real app, you would have more sophisticated logic
    const caloriesBurned = filteredWorkouts.reduce((total, workout) => {
      try {
        const details = workout.details as WorkoutDetails;
        return total + (details?.caloriesBurned || 0);
      } catch {
        return total;
      }
    }, 0);

    // Get today's plan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayPlan = await prisma.dailyPlan.findFirst({
      where: {
        userId: currentUser.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get upcoming sessions
    const upcomingSessions = await prisma.dailyPlan.findMany({
      where: {
        userId: currentUser.id,
        date: {
          gt: today,
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 3,
    });

    return NextResponse.json({
      todayPlan: todayPlan || null,
      caloriesBurned,
      workoutStreak,
      healthScore,
      latestMetrics,
      upcomingSessions,
      recentPayments: payments,
    });
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
