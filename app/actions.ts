'use server'

import type { FormState } from '@/app/fetch-form'
import { prisma } from '@/util/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const AUTH_SECRET = process.env.AUTH_SECRET!

export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete('accessToken')
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
  const token = cookieStore.get('accessToken')

  if (!token) {
    redirect('/auth/login')
  }

  const decoded = jwt.verify(token.value, AUTH_SECRET) as Payload // { id: 23, email: 'test@example.com', iat: 1740307739, exp: 1740311339 }

  return decoded
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!

export async function refreshAccessToken() {
  const refreshToken = cookies().get('refreshToken')?.value

  if (!refreshToken) {
    return { error: 'Unauthorized' }
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      id: string
    }
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
    })

    if (!user || user.refreshToken !== refreshToken) {
      return { error: 'Invalid refresh token' }
    }

    // 新しいアクセストークン発行
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: '15m',
      },
    )

    // Cookie に新しいアクセストークンをセット
    cookies().set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 15,
    })

    return { message: 'Token refreshed' }
  } catch (error) {
    console.log(error)
  }
}

export async function fetchWithAuth(_: FormState) {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts/1')

  if (response.status === 401) {
    // 401 エラーならリフレッシュトークンを使って新しいアクセストークンを取得
    const refreshResponse = await refreshAccessToken()
    if (refreshResponse?.error) {
      const resuponse = await fetch(
        'https://jsonplaceholder.typicode.com/posts/1',
      ) // 再リクエスト
      return resuponse.json()
    }
  }

  return response.json()
}
