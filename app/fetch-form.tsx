'use client'
import { fetchWithAuth } from '@/app/actions'
import { useFormState } from 'react-dom'

export type FormState = {
  userId: number
  id: number
  title: string
  body: string
}

export default function FetchForm() {
  const [state, formAction] = useFormState(fetchWithAuth, null)
  return (
    <div>
      <form action={formAction}>
        <button className="rounded-md bg-blue-500 p-2 text-white" type="submit">
          データ取得
        </button>
      </form>
      <p>{state?.title}</p>
    </div>
  )
}
