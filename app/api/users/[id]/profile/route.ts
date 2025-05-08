import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, email, address, phone, role } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already used by another user
    const emailUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id }
      }
    });

    if (emailUser) {
      return NextResponse.json(
        { message: 'Email is already in use by another user' },
        { status: 409 }
      );
    }

    // Update the user profile using Prisma Client
    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        address,
        phone,
        role: role as any,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
