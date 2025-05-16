import { Modal } from '@/app/components/ui/Modal'
import QRCode from '@/app/components/QRCode'
import { getTable } from '@/lib/dal'

export default async function TableModal({
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
    <Modal>
      <QRCode tableNumber={`${table.tableNumber}`} />
    </Modal>
  )
}
