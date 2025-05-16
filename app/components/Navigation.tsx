import Link from 'next/link'
import {
  HomeIcon,
  PlusIcon,
  SettingsIcon,
  CoffeeIcon,
  ScrollTextIcon,
  Grid2X2Icon,
  UtensilsIcon,
} from 'lucide-react'
import AdminUsername from './AdminUsername'
import { Suspense } from 'react'
import NavLink from './NavLink'

export default async function Navigation() {
  return (
    <aside className="fixed inset-y-0 left-0 w-16 md:w-64 bg-gray-50 dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-dark-border-subtle flex flex-col py-4 px-2 md:px-4">
      <div className="flex items-center justify-center md:justify-start mb-8 px-2">
        <Link
          href="/admin"
          className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          <span className="hidden md:inline">QR-Menu</span>
          <span className="md:hidden">QR</span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col space-y-1">
        <NavLink
          href="/admin"
          icon={<HomeIcon size={20} />}
          label="Dashboard"
        />
        <NavLink
          href="/admin/products"
          icon={<CoffeeIcon size={20} />}
          label="Products"
        />
        <NavLink
          href="/admin/catalogs"
          icon={<ScrollTextIcon size={20} />}
          label="Catalog"
        />
        <NavLink
          href="/admin/tables"
          icon={<Grid2X2Icon size={20} />}
          label="Tables"
        />
        <NavLink
          href="/admin/orders"
          icon={<UtensilsIcon size={20} />}
          label="Orders"
        />
        <NavLink
          href="/admin/settings"
          icon={<SettingsIcon size={20} />}
          label="Settings"
        />
      </nav>

      <div className="pt-4 border-t border-gray-200 dark:border-dark-border-subtle">
        <Suspense fallback={<div>loading...</div>}>
          <AdminUsername />
        </Suspense>
      </div>
    </aside>
  )
}
