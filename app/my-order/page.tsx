'use client'
import { useState, useEffect } from 'react'
import { ChevronDown, Search, ArrowLeftIcon } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import ProductModal from '@/app/components/ProductModal'
import CartItemCard from '@/app/components/CartItemCard'
import Link from 'next/link'
import { CartItem } from '@/lib/types'

export default function MyOrderPage() {
  const [isModalShowing, setIsModalShowing] = useState(false)
  const [currentProduct, setCurrentProduct] = useState({} as CartItem)
  const [cartItemState, setCartItemState] = useState([] as CartItem[])
  const [tableInfoState, setTableInfoState] = useState(
    {} as { id: number; tableNumber: number }
  )

  const tax = 0.1
  const service = 0.05

  const handleProductModal = (product: CartItem) => {
    setCurrentProduct(product)
    setIsModalShowing(!isModalShowing)
  }

  const handleUpDown = (qty: number, totalPrice: number, cartIdx: number) => {
    const cart = localStorage.getItem('cart_items') || '[]'
    const parsed = JSON.parse(cart)
    if (parsed[cartIdx]) {
      parsed[cartIdx].cartId = cartIdx
      parsed[cartIdx].totalPrice = totalPrice
      parsed[cartIdx].qty = qty
      localStorage.setItem('cart_items', JSON.stringify(parsed))
    }

    checkCartItems()
  }

  const checkCartItems = () => {
    const cartItems = localStorage.getItem('cart_items') || '[]'
    const parsed = JSON.parse(cartItems)
    if (parsed.length >= 0) {
      parsed.forEach((z: any, i: number) => {
        z.cartId = i
      })
    }

    setCartItemState([...parsed])
    localStorage.setItem('cart_items', JSON.stringify(parsed))
  }

  useEffect(() => {
    checkCartItems()

    const tableInfoString = localStorage.getItem('table_info') || ''
    const tableInfo = JSON.parse(tableInfoString)
    setTableInfoState(tableInfo)
  }, [])

  return (
    <div className="max-w-md min-h-screen mx-auto bg-[#f9f3e3]">
      <div className="sticky top-0 z-10">
        {/* Header */}
        <div className="bg-[#e85c41] p-4 pb-6 flex justify-between items-center text-white text-2xl font-bold">
          <Link
            href={`catalog?table=${tableInfoState.tableNumber}`}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="size-8" /> My Order
          </Link>
          <p>Table number: {tableInfoState.tableNumber}</p>
        </div>
      </div>

      <div className="relative">
        <div className="flex justify-between items-center p-4 border-b-1 border-gray-400">
          <div className="font-bold text-sm">
            Ordered items ({cartItemState.reduce((a, b) => a + b.qty, 0)})
          </div>
          <Link
            href={`catalog?table=${tableInfoState.tableNumber}`}
            className="bg-[#2a3990] rounded-md p-2 text-white"
          >
            +Add Item
          </Link>
        </div>

        {/* Cart items */}
        <div>
          {cartItemState.map((item, i) => {
            return (
              <CartItemCard
                key={i}
                idx={i}
                cartItem={item}
                handleProductModal={handleProductModal}
                handleUpDown={handleUpDown}
              />
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="flex flex-col p-1">
          <p className="font-bold p-1">Order Summary</p>
          <div className="p-2 border-b-1 border-dashed border-gray-400">
            <div className="flex justify-between">
              <p>Qty</p>
              <p>{cartItemState.reduce((a, b) => a + b.qty, 0)} items(s)</p>
            </div>
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(cartItemState.reduce((a, b) => a + b.totalPrice, 0))}
              </p>
            </div>
            <div className="flex justify-between">
              <p>Service</p>
              <p>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(
                  cartItemState.reduce((a, b) => a + b.totalPrice, 0) * service
                )}
              </p>
            </div>
            <div className="flex justify-between">
              <p>Tax</p>
              <p>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(
                  cartItemState.reduce((a, b) => a + b.totalPrice, 0) *
                    (1 + service) *
                    tax
                )}
              </p>
            </div>
          </div>
          <div className="flex justify-between font-bold p-2">
            <p>Grand Total</p>
            <p>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(
                cartItemState.reduce((a, b) => a + b.totalPrice, 0) *
                  (1 + service) *
                  (1 + tax)
              )}
            </p>
          </div>
        </div>

        <ProductModal
          isShowing={isModalShowing}
          cartId={currentProduct.cartId}
          qty={currentProduct.qty}
          product={currentProduct}
          isEdit={true}
          checkCartItems={checkCartItems}
          onClose={() => {
            setIsModalShowing(false)
            setCurrentProduct({} as CartItem)
          }}
        />
      </div>

      {/* Footer */}
      {cartItemState.length ? (
        <div className="sticky flex bottom-0 max-w-md z-20 p-3">
          <Button className="bg-[#2a3990] grow flex justify-center gap-6 rounded-xl text-white font-bold">
            <p>Proceed to Payment</p>
            <p>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(
                cartItemState.reduce((a, b) => a + b.totalPrice, 0) *
                  (1 + service) *
                  (1 + tax)
              )}
            </p>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
