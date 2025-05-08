import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get a specific metric
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metricId = params.id;
    
    // Fetch the metric
    const metric = await prisma.userMetric.findUnique({
      where: {
        id: metricId
      }
    });
    
    if (!metric) {
      return NextResponse.json(
        { message: 'Metric not found' },
        { status: 404 }
      );
    }
    
    // Ensure the metric belongs to the current user
    if (metric.userId !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(metric);
  } catch (error) {
    console.error('Error fetching metric:', error);
    return NextResponse.json(
      { message: 'Failed to fetch metric' },
      { status: 500 }
    );
  }
}

// Update a specific metric
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metricId = params.id;
    
    // Check if the metric exists and belongs to the user
    const existingMetric = await prisma.userMetric.findUnique({
      where: {
        id: metricId
      }
    });
    
    if (!existingMetric) {
      return NextResponse.json(
        { message: 'Metric not found' },
        { status: 404 }
      );
    }
    
    if (existingMetric.userId !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const { value, unit, notes, recordedAt } = await request.json();
    
    // Update the metric
    const updatedMetric = await prisma.userMetric.update({
      where: {
        id: metricId
      },
      data: {
        value: value !== undefined ? parseFloat(value) : undefined,
        unit,
        notes,
        recordedAt: recordedAt ? new Date(recordedAt) : undefined
      }
    });
    
    return NextResponse.json(updatedMetric);
  } catch (error) {
    console.error('Error updating metric:', error);
    return NextResponse.json(
      { message: 'Failed to update metric' },
      { status: 500 }
    );
  }
}

// Delete a specific metric
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metricId = params.id;
    
    // Check if the metric exists and belongs to the user
    const existingMetric = await prisma.userMetric.findUnique({
      where: {
        id: metricId
      }
    });
    
    if (!existingMetric) {
      return NextResponse.json(
        { message: 'Metric not found' },
        { status: 404 }
      );
    }
    
    if (existingMetric.userId !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Delete the metric
    await prisma.userMetric.delete({
      where: {
        id: metricId
      }
    });
    
    return NextResponse.json({ message: 'Metric deleted successfully' });
  } catch (error) {
    console.error('Error deleting metric:', error);
    return NextResponse.json(
      { message: 'Failed to delete metric' },
      { status: 500 }
    );
  }
}
