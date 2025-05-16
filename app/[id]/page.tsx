import { getTable } from '@/lib/dal'
import { notFound, redirect } from 'next/navigation'

const StartPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const table = await getTable(parseInt(id))
  if (!table) {
    notFound()
  }

  redirect(`/catalog?table=${table.tableNumber}`)
}

export default StartPage
