'use client'
import { signup } from '@/app/auth/signup/action'
import { initialFormState } from '@/app/auth/signup/state'
import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'

const Button = () => {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="rounded-md bg-blue-500 p-2 text-white"
      disabled={pending}
    >
      {pending ? 'サインイン中...' : 'サインイン'}
    </button>
  )
}

export default function Page() {
  const [formState, formDispatch] = useFormState(signup, initialFormState)
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">新規登録画面</h1>
      {formState.message && <p className="text-red-500">{formState.message}</p>}
      <form className="flex flex-col gap-4 text-black" action={formDispatch}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          defaultValue="kameda"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          defaultValue="test@example.com"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          defaultValue="Mytest123"
        />
        <Button />
      </form>
      <Link href="/auth/login" className="text-blue-500">
        ログインはこちら
      </Link>
    </div>
  )
}
