// /api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connect from '../../../../../../lib/db';
import Coach from '../../../../../../lib/models/coach';
import Client from '../../../../../../lib/models/clients';
import { sendPasswordResetEmail } from '../../../../../../lib/mail';

export const POST = async (req: Request) => {
  try {
    await connect();
    const { email } = await req.json();

    const user = await Coach.findOne({ email }) || await Client.findOne({ email });
    if (!user) {
      return new NextResponse(JSON.stringify({ message: 'If account exists, reset link sent' }), { status: 200 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 60; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetLink = `${process.env.PUBLIC_BASE_URL}/reset-password?token=${token}&email=${email}`;
    await sendPasswordResetEmail(email, resetLink);

    // Send email using nodemailer (or similar)
    console.log('Reset Link:', resetLink);

    return new NextResponse(JSON.stringify({ message: 'If account exists, reset link sent' }), { status: 200 });
  } catch (error) {
    return new NextResponse('Error sending reset email', { status: 500 });
  }
};
