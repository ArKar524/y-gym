import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/users/[userId]/metrics
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = params.userId;
    
    // Fetch metrics for the specified user
    const metrics = await prisma.userMetric.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        recordedAt: "desc",
      },
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Error fetching user metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch user metrics" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users/[userId]/metrics
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = params.userId;
    const { key, value, unit, notes, recordedAt } = await request.json();

    // Validate required fields
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create the metric
    const metric = await prisma.userMetric.create({
      data: {
        userId,
        key,
        value: parseFloat(value),
        unit,
        notes,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date()
      }
    });

    return NextResponse.json({ metric });
  } catch (error) {
    console.error("Error creating user metric:", error);
    return NextResponse.json(
      { error: "Failed to create user metric" },
      { status: 500 }
    );
  }
}
