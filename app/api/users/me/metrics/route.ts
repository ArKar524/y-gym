import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Get metrics for the current user
export async function GET(request: NextRequest) {
  try {
    // Get current user from auth
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const metricKey = url.searchParams.get('key');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Build where clause for database query
    const whereClause: any = {
      userId: currentUser.id
    };
    
    if (metricKey) {
      whereClause.key = metricKey;
    }
    
    if (startDate) {
      whereClause.recordedAt = {
        ...whereClause.recordedAt,
        gte: new Date(startDate)
      };
    }
    
    if (endDate) {
      whereClause.recordedAt = {
        ...whereClause.recordedAt,
        lte: new Date(endDate)
      };
    }
    
    // Fetch metrics from database
    const metrics = await prisma.userMetric.findMany({
      where: whereClause,
      orderBy: {
        recordedAt: 'desc'
      }
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// Create a new metric
export async function POST(request: NextRequest) {
  try {
    // Get current user from auth
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { key, value, unit, notes, recordedAt } = await request.json();
    
    // Validate required fields
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a new metric in the database
    const metric = await prisma.userMetric.create({
      data: {
        userId: currentUser.id,
        key,
        value: parseFloat(value.toString()),
        unit: unit || null,
        notes: notes || null,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date()
      }
    });
    
    return NextResponse.json({ metric });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}
