import Link from 'next/link'
import Button from '@/app/components/ui/Button'
import NewTable from '@/app/components/NewTable'
import { PlusIcon } from 'lucide-react'
import { getTables } from '@/lib/dal'
import { createTable } from '@/app/actions/tables'
import { Suspense } from 'react'

export default async function AdminTablesPage() {
  const tables = (await getTables()) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Tables</h1>
        <NewTable />
      </div>
      {tables.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-gray-200 shadow-sm">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-100 bg-gray-100 dark:bg-gray-600 border-b border-gray-200">
            <div className="col-span-6">ID</div>
            <div className="col-span-6">Table Number</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-300">
            {tables.map((table) => (
              <Link
                key={table.id}
                href={`/admin/tables/${table.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-400 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-gray-800">
                  <div className="col-span-6 font-medium truncate">
                    {table.id}
                  </div>
                  <div className="col-span-6">{table.tableNumber}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-gray-200 rounded-lg bg-dark dark:bg-gray-200 p-8">
          <h3 className="text-lg font-medium mb-2">No tables found</h3>
          <p className="text-gray-500 dark:text-gray-600 mb-6">
            Get started by creating your first table.
          </p>
        </div>
      )}
    </div>
  )
}
