import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, email, address, phone } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists for another user
    if (email) {
      type UserWithId = { id: string };
      const existingUsers = await prisma.$queryRaw<UserWithId[]>`
        SELECT id FROM "User"
        WHERE email = ${email}
        LIMIT 1
      `;

      const existingUser = existingUsers[0];

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { message: 'Email is already in use by another account' },
          { status: 409 }
        );
      }
    }

    // Update user profile using raw query to avoid type conversion issues
    await prisma.$executeRaw`
      UPDATE "User"
      SET 
        name = ${name},
        email = ${email},
        address = ${address},
        phone = ${phone}
      WHERE id = ${userId}
    `;

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
