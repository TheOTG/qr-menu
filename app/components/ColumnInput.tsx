import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableItemInput from './SortableItemInput'
import { ChangeEvent } from 'react'

interface ColumnProps extends React.HTMLAttributes<HTMLElement> {
  addonId: number
  items: any
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement>,
    itemId: number,
    addonId: number
  ) => void
  handleRemoveAddonItem: (itemId: number, addonId: number) => void
  isPending: boolean
}

const ColumnInput = ({
  addonId,
  items,
  handleInputChange,
  handleRemoveAddonItem,
  isPending,
  className,
}: ColumnProps) => {
  return (
    <div className={className}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item: any) => (
          <SortableItemInput
            key={item.id}
            id={item.id}
            addonId={addonId}
            name={item.name}
            price={item.price}
            handleInputChange={handleInputChange}
            handleRemoveAddonItem={handleRemoveAddonItem}
            isPending={isPending}
          />
        ))}
      </SortableContext>
    </div>
  )
}

export default ColumnInput
