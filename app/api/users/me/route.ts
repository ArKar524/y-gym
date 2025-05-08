import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get current user's profile
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

    // Use raw query to avoid type conversion issues, as mentioned in the memory
    const users = await prisma.$queryRaw`
      SELECT id, name, email, address, phone, "imageUrl", role, "createdAt"
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
