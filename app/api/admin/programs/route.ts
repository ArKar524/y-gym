import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/programs - Get all programs
export async function GET() {
  try {
    // Use Prisma client to fetch all programs
    const programs = await prisma.program.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/programs - Create a new program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, duration, price, imageUrl, active = true } = body;
    
    // Validate required fields
    if (!name || !description || duration === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Convert values to appropriate types
    const durationValue = typeof duration === 'string' ? parseInt(duration) : duration;
    const priceValue = typeof price === 'string' ? parseFloat(price) : price;
    
    // Use Prisma client to create the program
    const program = await prisma.program.create({
      data: {
        name,
        description,
        duration: durationValue,
        price: priceValue,
        imageUrl: imageUrl || null,
        active
      }
    });
    
    if (!program) {
      throw new Error('Failed to create program');
    }
    
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create program' },
      { status: 500 }
    );
  }
}
