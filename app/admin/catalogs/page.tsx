import { getCatalogs, getCustomerCatalog } from '@/lib/dal'
import Link from 'next/link'
import Button from '@/app/components/ui/Button'
import { PlusIcon } from 'lucide-react'

export default async function AdminCatalogPage() {
  const catalogs = (await getCatalogs()) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Catalogs</h1>
        <Link href="/admin/catalogs/new">
          <Button className="bg-indigo-500">
            <span className="flex items-center">
              <PlusIcon size={18} className="mr-2" />
              New Catalog
            </span>
          </Button>
        </Link>
      </div>
      {catalogs.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-gray-200 shadow-sm">
          {/* Header row */}
          <div className="grid grid-cols-6 gap-4 px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-100 bg-gray-100 dark:bg-gray-600 border-b border-gray-200">
            <div className="col-span-3">ID</div>
            <div className="col-span-3">Name</div>
          </div>

          {/* Product rows */}
          <div className="divide-y divide-gray-300">
            {catalogs.map((catalog) => (
              <Link
                key={catalog.id}
                href={`/admin/catalogs/${catalog.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-400 transition-colors"
              >
                <div className="grid grid-cols-6 gap-4 px-6 py-4 items-center text-gray-800">
                  <div className="col-span-3 font-medium truncate">
                    {catalog.id}
                  </div>
                  <div className="col-span-3">{catalog.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-gray-200 rounded-lg bg-dark dark:bg-gray-200 p-8">
          <h3 className="text-lg font-medium mb-2">No catalogs found</h3>
          <p className="text-gray-500 dark:text-gray-600 mb-6">
            Get started by creating your first catalog.
          </p>
        </div>
      )}
    </div>
  )
}
