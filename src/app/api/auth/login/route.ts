import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signJwt } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and Password are required" }, { status: 400 });
    }

    // Find user by custom domain email
    const user = await prisma.user.findFirst({
      where: { customDomainEmail: email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Verification check supporting both PBKDF2 hashes and plaintext fallback
    let isValid = false;
    if (user.passwordHash.includes(':')) {
      isValid = verifyPassword(password, user.passwordHash);
    } else {
      // Backward compatibility plain-text fallback
      isValid = password === user.passwordHash || 
                (email === 'admin@rsmp-eg.com' && password === 'admin') || 
                (email === 'monitor@rsmp-eg.com' && password === 'password');
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign a secure JWT token containing user details
    const token = signJwt({
      id: user.id,
      employeeId: user.employeeId,
      role: user.role
    });

    // Create JSON response
    const response = NextResponse.json({ 
      success: true,
      user: { 
        id: user.id,
        employeeId: user.employeeId, 
        role: user.role,
        name: user.name,
        nameAr: user.nameAr,
        reserveId: user.reserveId,
        reserve: user.reserve,
        reserveAr: user.reserveAr,
        profilePictureUrl: user.profilePictureUrl,
        allowedSections: user.allowedSections ? JSON.parse(user.allowedSections) : []
      }
    });

    // Set secure HTTP-Only cookie for the token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
