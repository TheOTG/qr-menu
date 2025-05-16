import { getCatalog } from '@/lib/dal'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import CatalogForm from '@/app/components/CatalogForm'
import { getProducts } from '@/lib/dal'
import { Catalog, Product } from '@/db/schema'

export default async function AdminCatalogEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // const data = await getCatalog(parseInt(id))
  // const catalog = data?.catalog
  // const products = data?.products || []
  const catalog = (await getCatalog(parseInt(id))) as Catalog
  const products = (await getProducts()) || []

  if (catalog?.categoryList) {
    catalog.categoryList.forEach((category: any, i: number) => {
      category.id = i + 1
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Link
        href="/admin/catalogs"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-600 dark:hover:text-gray-800 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Back to Catalogs
      </Link>

      <h1 className="text-2xl font-bold mb-6">Create New Catalog</h1>

      <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-sm p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <CatalogForm
            nextId={catalog?.categoryList ? catalog.categoryList.length + 1 : 1}
            catalog={catalog}
            isEditing={true}
            productList={products}
          />
        </Suspense>
      </div>
    </div>
  )
}
