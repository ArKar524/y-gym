import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Get all workouts for the current user
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

    // Use Prisma client to fetch workouts
    const workouts = await prisma.dailyPlan.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        date: 'desc'
      },
      select: {
        id: true,
        userId: true,
        title: true,
        details: true,
        date: true,
        createdAt: true
      }
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

// Create a new workout
export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const { title, date, exercises, notes } = await request.json();

    // Validate input
    if (!title || !date || !exercises || !Array.isArray(exercises)) {
      return NextResponse.json(
        { message: 'Invalid workout data' },
        { status: 400 }
      );
    }

    // Format workout details
    const details = {
      exercises: exercises.map(exercise => ({
        ...exercise,
        id: exercise.id || uuidv4()
      })),
      notes
    };

    // Create workout using Prisma client
    const formattedDate = new Date(date);
    
    const workout = await prisma.dailyPlan.create({
      data: {
        userId: userId,
        title: title,
        details: details,
        date: formattedDate
      }
    });

    return NextResponse.json({ 
      id: workout.id,
      message: 'Workout created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    
    // Format error message for better debugging
    let errorMessage = 'Failed to create workout';
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2003') {
        errorMessage = 'The user associated with this workout does not exist';
      } else if (error.code === 'P2002') {
        errorMessage = 'A workout with these details already exists';
      }
    }
    
    return NextResponse.json(
      { 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error : undefined 
      },
      { status: 500 }
    );
  }
}
