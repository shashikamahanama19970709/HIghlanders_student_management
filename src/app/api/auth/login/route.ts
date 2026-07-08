import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface LoginRequest {
  email: string;
  password: string;
  role: 'admin' | 'student';
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // 1. Search for user in database
    const db = await getDatabase();

    // Auto-seed default admin user if none exists
    const adminExists = await db.collection('users').findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('[Auth Seeder] Creating default admin: admin@example.com / 12345');
      const defaultAdminPassword = await bcrypt.hash('12345', 12);
      await db.collection('users').insertOne({
        email: 'admin@example.com',
        password: defaultAdminPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const dbUser = await db.collection('users').findOne({ email, role });
    
    let isPasswordValid = false;
    let loggedInUser = null;
    
    if (dbUser) {
      // Validate using bcrypt for database user
      isPasswordValid = await bcrypt.compare(password, dbUser.password);
      if (isPasswordValid) {
        loggedInUser = {
          email: dbUser.email,
          name: dbUser.profile ? `${dbUser.profile.firstName} ${dbUser.profile.lastName}` : 'Admin User',
          role: dbUser.role,
        };
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
