import { getCurrentAdmin } from '@/lib/dal'
import { Suspense, ReactNode } from 'react'
import Navigation from '../components/Navigation'

export default async function AdminLayout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  // const admin = await getCurrentAdmin()
  return (
    <div className="min-h-screen bg-gray-300">
      <Suspense>
        <Navigation />
        <main className="pl-16 md:pl-64 pt-0 min-h-screen">
          <div>{modal}</div>
          <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
        </main>
      </Suspense>
    </div>
  )
}
