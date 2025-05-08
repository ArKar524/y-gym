import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Get a specific workout
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use Prisma client to fetch the workout
    const workout = await prisma.dailyPlan.findUnique({
      where: {
        id: id,
        userId: userId
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

    if (!workout) {
      return NextResponse.json(
        { message: 'Workout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { message: 'Failed to fetch workout' },
      { status: 500 }
    );
  }
}

// Update a workout
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.dailyPlan.findUnique({
      where: {
        id: id,
        userId: userId
      },
      select: {
        id: true
      }
    });

    if (!existingWorkout) {
      return NextResponse.json(
        { message: 'Workout not found or unauthorized' },
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

    // Update workout using Prisma client
    const formattedDate = new Date(date);
    
    await prisma.dailyPlan.update({
      where: {
        id: id,
        userId: userId
      },
      data: {
        title: title,
        details: details,
        date: formattedDate
      }
    });

    return NextResponse.json({ 
      message: 'Workout updated successfully' 
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json(
      { message: 'Failed to update workout' },
      { status: 500 }
    );
  }
}

// Delete a workout
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.dailyPlan.findUnique({
      where: {
        id: id,
        userId: userId
      },
      select: {
        id: true
      }
    });

    if (!existingWorkout) {
      return NextResponse.json(
        { message: 'Workout not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete workout using Prisma client
    await prisma.dailyPlan.delete({
      where: {
        id: id,
        userId: userId
      }
    });

    return NextResponse.json({ 
      message: 'Workout deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      { message: 'Failed to delete workout' },
      { status: 500 }
    );
  }
}
