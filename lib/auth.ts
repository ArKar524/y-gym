import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
};

// Set authentication cookies in response
export function setAuthCookies(user: User, response: NextResponse) {
  // In a real app, you would use a proper JWT token with encryption
  // For simplicity, we're just setting the user ID and role
  
  // Set auth cookie with user ID
  response.cookies.set({
    name: 'auth',
    value: user.id,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  
  // Set role cookie
  response.cookies.set({
    name: 'role',
    value: user.role,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  
  return response;
}

// Clear authentication cookies
export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('auth');
  response.cookies.delete('role');
  return response;
}

// Get current user from cookies
export function getCurrentUser(): User | null {
  // Using try-catch because cookies() can throw in middleware contexts
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth');
    
    if (!authCookie?.value) {
      return null;
    }
    
    // In a real app, you would verify the token and fetch user data from database
    // For simplicity, we're just returning a mock user based on the role
    const roleCookie = cookieStore.get('role');
    const roleValue = roleCookie?.value as 'ADMIN' | 'MEMBER' | undefined;
    
    if (!roleValue) {
      return null;
    }
  
    return {
      id: authCookie.value,
      name: roleValue === 'ADMIN' ? 'Admin User' : 'Member User',
      email: roleValue === 'ADMIN' ? 'admin@example.com' : 'member@example.com',
      role: roleValue,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
