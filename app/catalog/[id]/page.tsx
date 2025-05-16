import { Suspense } from 'react'
import Catalog from '@/app/components/Catalog'

export default async function CatalogPage() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <Catalog searchParams={searchParams} />
    </Suspense>
  )
}
