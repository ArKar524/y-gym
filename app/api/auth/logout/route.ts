import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Create a response
    const response = NextResponse.json({
      message: "Logout successful",
    });
    
    // Clear authentication cookies
    return clearAuthCookies(response);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
