import { NextRequest, NextResponse } from "next/server";
import prisma from '../../../../lib/prisma';

// GET /api/admin/payments - Get all payments or filter by userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Build query based on filters
    const where: { userId?: string } = {};
    if (userId && userId !== 'all') {
      where.userId = userId;
    }

    // Use Prisma client to fetch payments with user and program details
    const payments = await prisma.payment.findMany({
      where,
      orderBy: {
        paidAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        program: {
          select: {
            id: true,
            name: true,
            price: true
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
      userName: payment.user.name,
      userEmail: payment.user.email,
      program: payment.program ? {
        id: payment.program.id,
        name: payment.program.name,
        price: payment.program.price
      } : null
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}

// POST /api/admin/payments - Create a new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, programId, amount, method, transactionRef } = body;

    // Validate required fields
    if (!userId || amount === undefined || !method || !transactionRef) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if transaction reference is unique
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionRef },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Transaction reference must be unique" },
        { status: 400 }
      );
    }

    // Check if program exists if programId is provided
    if (programId) {
      const program = await prisma.program.findUnique({
        where: { id: programId },
      });

      if (!program) {
        return NextResponse.json(
          { error: "Program not found" },
          { status: 404 }
        );
      }
    }

    // Create new payment with proper type handling
    const payment = await prisma.payment.create({
      data: {
        userId,
        // Ensure programId is either a valid UUID string or null
        programId: programId && programId !== 'none' && programId !== '' ? programId : null,
        amount,
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
    console.error("Error creating payment:", error);
    // Format the error message for better debugging
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: "Failed to create payment", 
        details: errorMessage,
        name: error instanceof Error ? error.name : 'Unknown' 
      },
      { status: 500 }
    );
  }
}
