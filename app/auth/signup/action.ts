'use server'

import type { FormState } from '@/app/auth/signup/state'
import { prisma } from '@/util/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
const AUTH_SECRET = process.env.AUTH_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!

export async function signup(_: FormState, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // リフレッシュトークン（長期間有効）
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d', // 7日間有効
    })
    // アクセストークン(短期間有効)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      AUTH_SECRET,
      {
        expiresIn: '1m',
      },
    )

    // リフレッシュトークンをデータベースに保存
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    })

    cookies().set('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 10, // 60秒
    })

    cookies().set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7日間
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { message: '「表示名」がすでに使用されています' }
      }
    }
    // それ以外のエラー
    return { message: 'エラーが発生しました' }
  }
  redirect('/')
}
