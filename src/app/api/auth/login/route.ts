import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, password } = body;

    if (!employeeId || !password) {
      return NextResponse.json({ error: "Employee ID and Password are required" }, { status: 400 });
    }

    // Find user in Prisma SQLite database
    const user = await prisma.user.findUnique({
      where: { employeeId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Verification check supporting seeded hashes and simple credentials for testing
    let isValid = false;
    if (employeeId === 'ADMIN-01' && (password === 'admin' || password === 'hashed_admin_password')) {
      isValid = true;
    } else if (employeeId === 'MON-102' && (password === 'password' || password === 'hashed_monitor_password')) {
      isValid = true;
    } else if (password === user.passwordHash) {
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ 
      token: "mock-jwt-token-12345",
      user: { 
        employeeId: user.employeeId, 
        role: user.role,
        name: user.name,
        nameAr: user.nameAr,
        reserveId: user.reserveId,
        reserve: user.reserve,
        reserveAr: user.reserveAr,
        allowedSections: user.allowedSections ? JSON.parse(user.allowedSections) : []
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
