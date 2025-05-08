import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { compare, hash } from 'bcrypt';

// Update current user's password
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
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get user with password using raw query to avoid type conversion issues
    type UserWithPassword = { id: string; password: string };
    const users = await prisma.$queryRaw<UserWithPassword[]>`
      SELECT id, password
      FROM "User"
      WHERE id = ${userId}
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const passwordMatch = await compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password using raw query
    await prisma.$executeRaw`
      UPDATE "User"
      SET password = ${hashedPassword}
      WHERE id = ${userId}
    `;

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { message: 'Failed to update password' },
      { status: 500 }
    );
  }
}
