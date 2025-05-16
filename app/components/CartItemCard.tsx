'use client'
import Image from 'next/image'
import windowSVG from '@/public/window.svg'
import Button from './ui/Button'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { CartItem } from '@/lib/types'

interface CartItemProps {
  idx: number
  cartItem: CartItem
  handleProductModal: (product: CartItem) => void
  handleUpDown: (qty: number, totalPrice: number, cartIdx: number) => void
}

export default function CartItemCard({
  idx,
  cartItem,
  handleProductModal,
  handleUpDown,
}: CartItemProps) {
  const { name, image, thumbnail, notes, totalPrice, qty, addons } = cartItem

  const handleUpDownChild = (offset: number) => {
    if ((qty > 1 && offset === -1) || (qty < 15 && offset === 1)) {
      handleUpDown(qty + offset, (totalPrice * (qty + offset)) / qty, idx)
    }
  }

  return (
    <div className="flex gap-3 p-2 border-b-1 border-gray-400 min-h-32">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={windowSVG}
          alt={name}
          width={80}
          height={120}
          className="rounded-lg bg-gray-200"
        />
      </div>

      <div className="flex-6 flex flex-col overflow-hidden">
        <h4 className="font-bold">{name}</h4>
        <p className="text-xs">
          {addons
            ?.map((addon) => {
              const list: string[] = []
              addon.items.forEach((item) => {
                if (item.isSelected) list.push(item.name)
              })
              return list.join(', ')
            })
            .filter((z) => z.length)
            .join(', ')}
        </p>
        <p className="text-xs text-gray-500">
          {notes ? notes : 'No notes yet'}
        </p>
        <p className="grow font-bold content-end">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(totalPrice)}
        </p>
      </div>

      <div className="grow-1 flex flex-col justify-between items-center">
        <Button
          size="sm"
          className="bg-transparent text-[#2a3990] border-1 border-[#2a3990] rounded-md text-center hover:bg-transparent cursor-pointer pt-2 pb-2 self-end"
          onClick={() => {
            cartItem.cartId = idx
            cartItem.qty = qty
            handleProductModal(cartItem)
          }}
        >
          Edit
        </Button>
        <div className="flex gap-2">
          <MinusIcon
            className={`border-[#2a3990] border-2 rounded-md select-none ${
              qty <= 1
                ? 'bg-gray-300 opacity-50'
                : 'cursor-pointer active:bg-gray-400'
            }`}
            onClick={() => handleUpDownChild(-1)}
          />
          <p>{qty}</p>
          <PlusIcon
            className={`border-[#2a3990] border-2 rounded-md select-none ${
              qty >= 15
                ? 'bg-gray-300 opacity-50'
                : 'cursor-pointer active:bg-gray-400'
            }`}
            onClick={() => handleUpDownChild(1)}
          />
        </div>
      </div>
    </div>
  )
}
