import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { getDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface LoginRequest {
  email: string;
  password: string;
  role: 'admin' | 'student';
}

// Mock users for demonstration (in production, these would come from database)
const mockUsers = {
  admin: {
    email: 'admin@highlanders.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  student: {
    email: 'student@highlanders.com',
    password: 'password',
    name: 'Student User',
    role: 'student',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password, role } = body;

    // Debug logging
    console.log('Login attempt:', { email, role, passwordLength: password?.length });

    // Validation
    if (!email || !password || !role) {
      console.log('Validation failed:', { hasEmail: !!email, hasPassword: !!password, hasRole: !!role });
      return NextResponse.json(
        { success: false, error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // 1. Search for user in database
    const db = await getDatabase();
    const dbUser = await db.collection('users').findOne({ email, role });
    
    let isPasswordValid = false;
    let loggedInUser = null;
    
    if (dbUser) {
      // Validate using bcrypt for database user
      isPasswordValid = await bcrypt.compare(password, dbUser.password);
      if (isPasswordValid) {
        loggedInUser = {
          email: dbUser.email,
          name: dbUser.profile ? `${dbUser.profile.firstName} ${dbUser.profile.lastName}` : dbUser.email,
          role: dbUser.role,
        };
      }
    }
    
    // 2. Fall back to mock users for demo/testing if not found in DB
    if (!loggedInUser) {
      const mockUser = mockUsers[role];
      if (mockUser && mockUser.email === email) {
        isPasswordValid = password === mockUser.password;
        if (isPasswordValid) {
          loggedInUser = {
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
          };
        }
      }
    }
    
    if (!loggedInUser || !isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token using the validated user info
    const token = jwt.sign(
      { 
        userId: loggedInUser.email,
        email: loggedInUser.email,
        role: loggedInUser.role,
        name: loggedInUser.name,
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      data: {
        user: loggedInUser,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
