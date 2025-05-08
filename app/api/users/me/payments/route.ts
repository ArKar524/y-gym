import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/users/me/payments - Get current user's payments
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // No need to check if user exists since we're using the userId directly

    // Use Prisma client to fetch user payments with program details
    const payments = await prisma.payment.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        paidAt: 'desc'
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            imageUrl: true
          }
        }
      }
    });
    
    // Transform the data to match the expected format in the frontend
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      userId: payment.userId,
      programId: payment.programId,
      amount: payment.amount,
      method: payment.method,
      transactionRef: payment.transactionRef,
      paidAt: payment.paidAt.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      program: payment.program || null
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}

// POST /api/users/me/payments - Create a new payment for the current user
export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth cookie
    const userId = request.cookies.get('auth')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { programId, amount, method, transactionRef } = body;

    // Validate required fields
    if (!programId || amount === undefined || !method || !transactionRef) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Check if transaction reference is unique
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionRef },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Transaction reference must be unique' },
        { status: 400 }
      );
    }

    // Create new payment with proper type handling
    const payment = await prisma.payment.create({
      data: {
        userId,
        // Ensure programId is a valid UUID string
        programId: programId,
        amount: program.price, // Use the program price as the payment amount
        method,
        transactionRef,
        paidAt: new Date(),
      },
      include: {
        program: true
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
