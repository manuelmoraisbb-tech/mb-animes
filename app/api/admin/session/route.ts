import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('mb_admin_token')?.value
  const expected = process.env.ADMIN_PASSWORD || 'admin123'

  return NextResponse.json({ authenticated: token === expected })
}
