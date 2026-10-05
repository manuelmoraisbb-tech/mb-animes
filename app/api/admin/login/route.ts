import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const password = body.password

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha inválida' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('mb_admin_token', ADMIN_PASSWORD, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
