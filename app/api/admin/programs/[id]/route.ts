import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/programs/[id] - Get a specific program
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Use Prisma client to fetch the program
    const program = await prisma.program.findUnique({
      where: { id }
    });
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/programs/[id] - Update a program
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, duration, price, imageUrl, active } = body;
    
    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id }
    });
    
    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    // Update program
    const updatedProgram = await prisma.program.update({
      where: { id },
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        imageUrl,
        active: active !== undefined ? active : existingProgram.active
      }
    });
    
    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/programs/[id] - Delete a program
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id }
    });
    
    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    // Delete program
    await prisma.program.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Program deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
