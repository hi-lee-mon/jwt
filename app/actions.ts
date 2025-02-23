'use server'

import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const AUTH_SECRET = process.env.AUTH_SECRET!

export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete('token')
  redirect('/auth/login')
}

type Payload = {
  id: number
  email: string
  iat: number
  exp: number
}
export async function getUser(): Promise<Payload> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  if (!token) {
    redirect('/auth/login')
  }

  const decoded = jwt.verify(token.value, AUTH_SECRET) as Payload // { id: 23, email: 'test@example.com', iat: 1740307739, exp: 1740311339 }

  return decoded
}
