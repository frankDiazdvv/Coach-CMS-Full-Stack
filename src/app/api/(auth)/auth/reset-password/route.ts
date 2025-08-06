// /api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import Coach from '../../../../../../lib/models/coach';
import Client from '../../../../../../lib/models/clients';

export const POST = async (req: Request) => {
  try {
    await connect();
    const { email, token, newPassword } = await req.json();

    const user = await Coach.findOne({ email }) || await Client.findOne({ email });

    if (!user || user.resetToken !== token || Date.now() > user.resetTokenExpiry) {
      return new NextResponse('Invalid or expired token', { status: 400 });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save(); // This will hash the password thanks to the pre('save') hook

    return new NextResponse(JSON.stringify({ message: 'Password reset successful' }), { status: 200 });
  } catch (error) {
    return new NextResponse('Error resetting password', { status: 500 });
  }
};
