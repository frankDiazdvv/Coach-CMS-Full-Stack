import { NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import Coach, { ICoach } from '../../../../../../lib/models/coach';
import Client, { IClient } from '../../../../../../lib/models/clients';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const POST = async (request: Request) => {
  try {
    await connect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse('Missing email or password', { status: 400 });
    }

    //Assume coach is loggin first
    let user: ICoach | IClient | null = await Coach.findOne({ email });
    let role = 'coach';

    // If no coach found, try to find client
    if(!user) {
      user = await Client.findOne({ email });
      role = 'client';
    }

    // If no user found, return error
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '10h' }
    );

    return new NextResponse(JSON.stringify({ token, role, id: user._id }), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error logging in: ' + error.message, { status: 500 });
  }
};