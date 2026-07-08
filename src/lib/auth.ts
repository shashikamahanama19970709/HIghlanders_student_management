import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, AuthResponse } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthService {
  /**
   * Generate JWT token
   */
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return null;
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Compare passwords
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Create auth response
   */
  static createAuthResponse(user: User): AuthResponse {
    return {
      user,
      token: this.generateToken(user._id),
    };
  }

  /**
   * Extract token from request headers
   */
  static extractTokenFromHeaders(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get user from token
   */
  static async getUserFromToken(token: string): Promise<User | null> {
    const decoded = this.verifyToken(token);
    if (!decoded) return null;

    try {
      const { getDatabase } = await import('@/lib/mongodb');
      const db = await getDatabase();
      // In route.ts login signs { userId: loggedInUser.email }
      const user = await db.collection('users').findOne({ email: decoded.userId });
      return user as any as User;
    } catch (error) {
      console.error('Error fetching user from token:', error);
      return null;
    }
  }
}
