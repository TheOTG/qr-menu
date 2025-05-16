'use client'
import Image from 'next/image'
import windowSVG from '@/public/window.svg'
import Button from './/ui/Button'
import { Product } from '@/db/schema'

interface ProductCardProps {
  product: Product
  handleProductModal: (product: Product) => void
}

export default function ProductCard({
  product,
  handleProductModal,
}: ProductCardProps) {
  const { name, image, thumbnail, description, price, useStock, stock } =
    product

  return (
    <div className="flex gap-3">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={windowSVG}
          alt={name}
          width={80}
          height={80}
          className="rounded-lg bg-gray-200"
        />
        {useStock && stock == 0 ? (
          <div className="absolute -rotate-45 bg-[#e85c41] text-white text-xs font-bold py-1 px-4 top-1/3 -left-4">
            SOLD OUT
          </div>
        ) : null}
      </div>
      <div className="grow flex flex-col overflow-hidden">
        <h4 className="font-bold">{name}</h4>
        <p className="text-xs text-gray-500 ">{description}</p>
        <div className="grow flex justify-between">
          <p className="font-bold self-end">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
            }).format(price)}
          </p>
          <Button
            className="bg-[#2a3990] text-white rounded-md self-end w-20 h-10 text-center"
            onClick={() => handleProductModal(product)}
          >
            +Add
          </Button>
        </div>
      </div>
    </div>
  )
}
