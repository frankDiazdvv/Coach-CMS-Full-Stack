import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function authMiddleware(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return new NextResponse('Unauthorized: No token provided', { status: 401 });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      id: string; 
      email: string; 
      role: 'coach' | 'client', 
    };
    // Optionally restrict routes by role
    if (request.url.includes('/api/clients') && request.method === 'POST' && decoded.role !== 'coach') {
      return new NextResponse('Unauthorized: Only coaches can create clients', { status: 403 });
    }
    return decoded; // Returns { id, email, role, name, imageUrl }
  } catch (error) {
    return new NextResponse('Unauthorized: Invalid token', { status: 401 });
  }
}