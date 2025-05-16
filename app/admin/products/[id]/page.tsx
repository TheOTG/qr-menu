import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import ProductForm from '@/app/components/ProductForm'
import { getProduct } from '@/lib/dal'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(parseInt(id))
  if (!product) {
    notFound()
  }

  let addonNextId: number = 1
  if (product?.addons) {
    product.addons.forEach((addon: any, i: number) => {
      addon.id = i + 1
      addon.items.forEach((item: any, i: number) => {
        item.id = i + 1
        addonNextId++
      })
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-600 dark:hover:text-gray-800 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Back to Products
      </Link>

      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-sm p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <ProductForm
            isEditing={true}
            product={product}
            nextId={product?.addons ? product.addons.length + 1 : 1}
            addonNextId={addonNextId}
          />
        </Suspense>
      </div>
    </div>
  )
}
