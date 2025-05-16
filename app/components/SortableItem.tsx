import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuIcon } from 'lucide-react'

interface SortableItemProps extends React.HTMLAttributes<HTMLElement> {
  id: string
  title: string
}

const SortableItem = ({ id, title }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="grid grid-cols-14 p-1"
    >
      <div className="col-span-5"></div>
      <MenuIcon className="col-span-1" />
      <p className="col-span-8">{title}</p>
    </div>
  )
}

export default SortableItem
