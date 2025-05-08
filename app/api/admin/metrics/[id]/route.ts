import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// DELETE /api/admin/metrics/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const metricId = params.id;
    
    // Check if metric exists
    const metric = await prisma.userMetric.findUnique({
      where: {
        id: metricId,
      },
    });

    if (!metric) {
      return NextResponse.json(
        { error: "Metric not found" },
        { status: 404 }
      );
    }

    // Delete the metric
    await prisma.userMetric.delete({
      where: {
        id: metricId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting metric:", error);
    return NextResponse.json(
      { error: "Failed to delete metric" },
      { status: 500 }
    );
  }
}
