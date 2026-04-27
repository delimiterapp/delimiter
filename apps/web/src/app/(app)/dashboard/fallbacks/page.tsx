import { redirect } from 'next/navigation'

export default function FallbacksPage() {
  redirect('/dashboard/connections')
}
