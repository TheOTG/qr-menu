import { Suspense } from 'react'
import Catalog from '@/app/components/Catalog'

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  return (
    <Suspense fallback={<div></div>}>
      <Catalog searchParams={searchParams} />
    </Suspense>
  )
}
