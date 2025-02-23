import { getUser, logout } from '@/app/actions'
import FetchForm from '@/app/fetch-form'
import { prisma } from '@/util/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = cookies()
  const token = cookieStore.get('accessToken')

  if (!token) {
    redirect('/auth/signup')
  }

  const myProfile = await getUser()

  const users = await prisma.user.findMany()

  return (
    <div>
      <h1 className="text-2xl font-bold">ユーザ一覧</h1>
      <p>{`ユーザID:${myProfile.id} がログインしています`}</p>

      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
      <form action={logout}>
        <button className="rounded-md bg-blue-500 p-2 text-white" type="submit">
          ログアウト
        </button>
      </form>
      <FetchForm />
    </div>
  )
}
