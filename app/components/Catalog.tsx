import { getTable, getCustomerCatalog } from '@/lib/dal'
import Menu from '@/app/components/Menu'
import { redirect } from 'next/navigation'

export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const { table } = await searchParams
  const tableInfo = await getTable(parseInt(table))
  if (!tableInfo) {
    redirect('/')
  }
  const catalog = (await getCustomerCatalog()) || []

  return <Menu tableInfo={tableInfo} catalog={catalog} />
}
