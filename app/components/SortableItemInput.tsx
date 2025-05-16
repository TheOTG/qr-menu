import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuIcon, XIcon } from 'lucide-react'
import { FormInput } from './ui/Form'
import { ChangeEvent } from 'react'

interface SortableItemInputProps extends React.HTMLAttributes<HTMLElement> {
  key: string | number
  id: string
  addonId: number
  name: string
  price: number
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement>,
    itemId: number,
    addonId: number
  ) => void
  handleRemoveAddonItem: (itemId: number, addonId: number) => void
  isPending: boolean
}

const SortableItemInput = ({
  id,
  addonId,
  name,
  price,
  handleInputChange,
  handleRemoveAddonItem,
  isPending,
}: SortableItemInputProps) => {
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
      className="grid grid-cols-12 gap-2 p-1"
    >
      <div className="col-span-1"></div>
      <MenuIcon className="col-span-1 self-center" />
      <FormInput
        id={`${name}-${id}`}
        name={`name-${id}`}
        placeholder="Addon name"
        defaultValue={name}
        required
        minLength={1}
        maxLength={100}
        disabled={isPending}
        className="col-span-4"
        onChange={(e) => {
          handleInputChange(e, parseInt(id), addonId)
        }}
      />
      <FormInput
        id={`price-${id}`}
        name={`price-${id}`}
        type="number"
        placeholder="Addon price"
        defaultValue={price}
        required
        minLength={0}
        maxLength={100}
        disabled={isPending}
        className="col-span-4"
        onChange={(e) => {
          handleInputChange(e, parseInt(id), addonId)
        }}
      />
      <div className="col-span-1 block m-auto">
        <XIcon
          className="hover:bg-red-500 hover:text-white active:bg-red-300 rounded-sm size-5 place-self-center"
          onClick={() => {
            handleRemoveAddonItem(parseInt(id), addonId)
          }}
        />
      </div>
    </div>
  )
}

export default SortableItemInput
