import { NextResponse } from 'next/server';

export async function POST() {
  // We'll handle sign-out on the client side instead
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
