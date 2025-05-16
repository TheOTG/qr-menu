import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableItem from './SortableItem'
import React from 'react'

interface ColumnProps extends React.HTMLAttributes<HTMLElement> {
  items: any
}

const Column = ({ items, className }: ColumnProps) => {
  return (
    <div className={className}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item: any) => (
          <SortableItem key={item.id} id={item.id} title={item.name} />
        ))}
      </SortableContext>
    </div>
  )
}

export default Column
