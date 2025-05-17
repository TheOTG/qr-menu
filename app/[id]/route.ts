import { getTable } from '@/lib/dal'
import { notFound, redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  if (typeof id !== 'number') notFound()

  const table = await getTable(id)
  if (!table) {
    notFound()
  }

  redirect(`/catalog?table=${table.tableNumber}`)
}
