import QRCode from '@/app/components/QRCode'
import { getTable } from '@/lib/dal'

export default async function Table({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const table = await getTable(parseInt(id))

  if (!table?.id) {
    return <h1 className="text-center">No Table Found for that ID.</h1>
  }

  return (
    <div className="mt-2 grid place-content-center">
      <QRCode tableNumber={`${table.tableNumber}`} />
    </div>
  )
}
