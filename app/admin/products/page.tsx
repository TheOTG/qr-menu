import Link from 'next/link'
import Button from '@/app/components/ui/Button'
import Search from '@/app/components/ui/Search'
import { PlusIcon, InfinityIcon } from 'lucide-react'
import { getProducts, searchProducts } from '@/lib/dal'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const { query } = await searchParams
  const products =
    (query ? await searchProducts(query) : await getProducts()) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>

        <Search placeholder="Search" disabled={false} />
        <Link href="/admin/products/new">
          <Button className="bg-indigo-500 hidden md:block">
            <span className="flex items-center">
              <PlusIcon size={18} className="mr-2" />
              New Product
            </span>
          </Button>
          <Button className="bg-indigo-500 hidden max-md:block">
            <PlusIcon size={18} />
          </Button>
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-gray-200 shadow-sm">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-100 bg-gray-100 dark:bg-gray-600 border-b border-gray-200">
            <div className="col-span-5">Name</div>
            <div className="col-span-2">SKU</div>
            <div className="col-span-3">Price</div>
            <div className="col-span-2">Stock</div>
          </div>

          {/* Product rows */}
          <div className="divide-y divide-gray-300">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-400 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-gray-800">
                  <div className="col-span-5 font-medium truncate">
                    {product.name}
                  </div>
                  <div className="col-span-2">{product.sku}</div>
                  <div className="col-span-3">{product.price}</div>
                  <div className="col-span-2">
                    {product.useStock ? product.stock : <InfinityIcon />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : query ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-gray-200 rounded-lg bg-dark dark:bg-gray-200 p-8">
          <h3 className="text-lg font-medium mb-2">
            No products found with search "{query}"
          </h3>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-gray-200 rounded-lg bg-dark dark:bg-gray-200 p-8">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-gray-600 mb-6">
            Get started by creating your first product.
          </p>
        </div>
      )}
    </div>
  )
}
