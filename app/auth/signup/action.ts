'use server'

import type { FormState } from '@/app/auth/signup/state'
import { prisma } from '@/util/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
const AUTH_SECRET = process.env.AUTH_SECRET!

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

    // JWT 発行
    const token = jwt.sign({ id: user.id, email: user.email }, AUTH_SECRET, {
      expiresIn: '1h', // 有効期限1時間
    })

    cookies().set('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60, // 1時間
    })
  } catch (error) {
    console.log('error=>', error)
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
