import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all workouts (admin only)
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
        {
          message: 'Forbidden: Admin access required',
          user: user
         },
        { status: 403 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const userId_filter = url.searchParams.get('userId');
    
    // Use Prisma client to fetch workouts with user information
    const workouts = await prisma.dailyPlan.findMany({
      where: userId_filter ? {
        userId: userId_filter
      } : undefined,
      orderBy: {
        date: 'desc'
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
    
    // Transform the data to include userName and userEmail at the top level
    const transformedWorkouts = workouts.map(workout => ({
      id: workout.id,
      userId: workout.userId,
      title: workout.title,
      details: workout.details,
      date: workout.date,
      createdAt: workout.createdAt,
      userName: workout.user.name,
      userEmail: workout.user.email
    }));

    return NextResponse.json(transformedWorkouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}
