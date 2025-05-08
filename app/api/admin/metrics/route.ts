import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/metrics
export async function GET() {
  try {
    // Check if user is authenticated and is an admin
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all metrics with user information
    const metrics = await prisma.userMetric.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        recordedAt: "desc",
      },
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Error fetching all metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
