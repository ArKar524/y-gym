import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { compare, hash } from 'bcrypt';

// Update user password
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Check if user exists and get current password hash
    const users = await prisma.$queryRaw`
      SELECT id, "passwordHash" FROM "User" WHERE id = ${id}
    `;

    if ((users as any[]).length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = (users as any[])[0];

    // If this is the first time setting a password (passwordHash is null)
    // We'll skip the current password check
    if (user.passwordHash) {
      // Verify current password
      const isPasswordValid = await compare(currentPassword, user.passwordHash);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
          { status: 401 }
        );
      }
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the password
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "passwordHash" = ${hashedPassword},
          "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { message: 'Failed to update password' },
      { status: 500 }
    );
  }
}
