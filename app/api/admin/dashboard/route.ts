import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get dashboard stats (admin only)
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });
    
    // Get total workouts count
    const totalWorkouts = await prisma.dailyPlan.count();
    
    // Get total payments amount
    const paymentsData = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });
    
    // Get active programs count
    const activePrograms = await prisma.program.count({
      where: {
        active: true
      }
    });
    
    // Get recent payments (last 5)
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: {
        paidAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        program: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Get recent workouts (last 5)
    const recentWorkouts = await prisma.dailyPlan.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Format the data for the dashboard
    const dashboardData = {
      users: {
        total: totalUsers,
        byRole: usersByRole.reduce((acc, role) => {
          acc[role.role] = role._count.id;
          return acc;
        }, {} as Record<string, number>)
      },
      workouts: {
        total: totalWorkouts
      },
      payments: {
        total: paymentsData._count.id,
        totalAmount: paymentsData._sum.amount || 0
      },
      programs: {
        active: activePrograms
      },
      recent: {
        payments: recentPayments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          method: payment.method,
          date: payment.paidAt,
          userName: payment.user.name,
          userEmail: payment.user.email,
          programName: payment.program.name
        })),
        workouts: recentWorkouts.map(workout => ({
          id: workout.id,
          title: workout.title,
          date: workout.date,
          createdAt: workout.createdAt,
          userName: workout.user.name,
          userEmail: workout.user.email
        }))
      }
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
