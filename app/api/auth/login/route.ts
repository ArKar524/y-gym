import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";
import { setAuthCookies } from "@/lib/auth";

type UserWithPassword = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MEMBER';
};

export async function POST(req: NextRequest) {
  try {
    const { email, password: userPassword } = await req.json();

    if (!email || !userPassword) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Instead of using raw query, use Prisma's findUnique with proper type casting
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true
      }
    }) as UserWithPassword | null;

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    // const passwordMatch = await compare(userPassword, user.password);

    // if (!passwordMatch) {
    //   return NextResponse.json(
    //     { message: "Invalid email or password" },
    //     { status: 401 }
    //   );
    // }

    // Don't include password in the response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: passwordField, ...userWithoutPassword } = user;

    // Create response with user data
    const response = NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
    
    // Set authentication cookies
    return setAuthCookies({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }, response);
  } catch (error) {
    console.error("Login error details:", error);
    return NextResponse.json(
      { message: "An error occurred during login", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
