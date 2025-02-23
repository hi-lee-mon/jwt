import { logout } from '@/app/actions'
import { prisma } from '@/util/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const users = await prisma.user.findMany()
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  console.log("cookieStore.get('token')=>", token)

  if (!token) {
    redirect('/auth/signup')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">ユーザ一覧</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <form action={logout}>
        <button type="submit">ログアウト</button>
      </form>
    </div>
  )
}
