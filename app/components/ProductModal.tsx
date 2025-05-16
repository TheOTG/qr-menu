'use client'
import gsap from 'gsap'
import { CSSTransition } from 'react-transition-group'
import { Product } from '@/db/schema'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import windowSVG from '@/public/window.svg'
import Button from './ui/Button'
import { XIcon, MinusIcon, PlusIcon } from 'lucide-react'
import { FormInput, FormTextarea } from './ui/Form'
import { CartItem } from '@/lib/types'

interface Props {
  product: Product | CartItem
  cartId: number
  qty: number
  isShowing: boolean
  isEdit: boolean
  onClose: () => void
  checkCartItems: () => void
}

export default function ProductModal({
  product,
  cartId,
  qty,
  isShowing,
  isEdit,
  onClose,
  checkCartItems,
}: Props) {
  const { id, name, image, thumbnail, description, price, addons } = product

  const [totalPrice, setTotalPrice] = useState(price)
  const [addonState, setAddonState] = useState(addons || [])
  const [noteState, setNoteState] = useState('')
  const [qtyState, setQtyState] = useState(qty)
  const nodeRef = useRef(null)

  const onEnter = () => {
    let total = price
    addons?.forEach((addon) => {
      addon.items.forEach((item) => {
        if (item.isSelected) total += item.price
      })
    })
    setTotalPrice(total * qty)
    setAddonState(addons || [])
    setNoteState('')
    setQtyState(qty)
    gsap.to('.backdrop', { opacity: 1 })
    gsap.fromTo('.content', { y: window.innerHeight }, { y: 0, duration: 0.3 })
  }
  const onExit = () => {
    setAddonState([])
    setTotalPrice(0)
  }

  const handleAddonItemChange = (addonIdx: number, itemIdx: number) => {
    if (addonState[addonIdx].type === 'multiple') {
      addonState[addonIdx].items[itemIdx].isSelected =
        !addonState[addonIdx].items[itemIdx].isSelected

      if (addonState[addonIdx].items[itemIdx].isSelected) {
        setTotalPrice(
          totalPrice + addonState[addonIdx].items[itemIdx].price * qtyState
        )
      } else {
        setTotalPrice(
          totalPrice - addonState[addonIdx].items[itemIdx].price * qtyState
        )
      }
    } else {
      let totalAddonItemPrice = 0
      addonState[addonIdx].items.forEach((item, i) => {
        if (item.isSelected && i !== itemIdx) {
          totalAddonItemPrice -= item.price
        }
        item.isSelected = i === itemIdx ? true : false
      })

      setTotalPrice(
        totalPrice +
          (addonState[addonIdx].items[itemIdx].price + totalAddonItemPrice) *
            qtyState
      )
    }

    setAddonState([...addonState])
  }

  const handleClick = () => {
    // check addon state for any required items
    const cartItems = localStorage.getItem('cart_items') || '[]'
    const parsed: CartItem[] = JSON.parse(cartItems)

    if (isEdit) {
      for (let i = 0; i < parsed.length; i++) {
        if (i === cartId) {
          parsed[i].qty = qtyState
          parsed[i].totalPrice = totalPrice
          parsed[i].addons = addonState as any
          parsed[i].notes = noteState
          break
        }
      }
    } else {
      parsed.push({
        id,
        cartId: parsed.length ? parsed.length - 1 : 0,
        name,
        qty: qtyState,
        description,
        price,
        totalPrice,
        addons: addonState as any,
        notes: noteState,
        image,
        thumbnail,
      })
    }
    localStorage.setItem('cart_items', JSON.stringify(parsed))
    checkCartItems()
    onClose()
  }

  const handleUpDown = (offset: number) => {
    if ((qtyState > 1 && offset === -1) || (qtyState < 15 && offset === 1)) {
      setQtyState(qtyState + offset)
      setTotalPrice((totalPrice * (qtyState + offset)) / qtyState)
    }
  }

  const handleRemove = () => {
    const cartItems = localStorage.getItem('cart_items') || '[]'
    const parsed: CartItem[] = JSON.parse(cartItems)

    parsed.splice(cartId, 1)

    localStorage.setItem('cart_items', JSON.stringify(parsed))
    checkCartItems()
    onClose()
  }

  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={isShowing}
      timeout={{ enter: 0, exit: 500 }}
      mountOnEnter
      unmountOnExit
      onEnter={onEnter}
      onExit={onExit}
    >
      <div className="fixed inset-0 z-50 flex flex-col justify-center max-w-md mx-auto">
        <div
          className="backdrop absolute inset-0 z-11 bg-black/20"
          onClick={onClose}
        />

        <div className="grow-1"></div>

        <XIcon
          className="content absolute z-25 top-1/10 right-2 rounded-full text-white bg-[#e85c41] size-8 cursor-pointer active:bg-[#ff9987]"
          onClick={onClose}
        />

        <div className="content h-8/10 z-20 rounded-t-lg bg-[#f9f3e3] flex flex-col scrollbar-hidden scrollbar-hidden-ef overscroll-none overflow-y-auto">
          <Image
            src={windowSVG}
            alt={name}
            className="rounded-lg bg-gray-200 w-full"
          />

          <div className="flex justify-between font-bold text-xl p-2">
            <div>{name}</div>
            <div>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(price)}
            </div>
          </div>

          <div className="border-b-1 border-gray-400 text-sm p-2">
            {description}
          </div>

          {addons?.map((addon, i) => (
            <div key={i} className="border-b-1 border-gray-400 p-2">
              <div className="font-bold text-md">{addon.name}</div>

              <div className="flex flex-col gap-1 pb-2">
                {addon.items.map((item, j) => (
                  <div
                    key={j}
                    className="flex justify-between text-gray-400 font-bold text-sm"
                  >
                    <div
                      className={`${item.isSelected ? 'text-[#e85c41]' : ''}`}
                    >
                      {item.name}
                    </div>
                    <div className="flex gap-2">
                      {item.price > 0 ? (
                        <div className="text-sm">
                          +
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                          }).format(item.price)}
                        </div>
                      ) : null}

                      <FormInput
                        name={addon.name}
                        checked={item.isSelected ? true : false}
                        type={addon.type === 'one' ? 'radio' : 'checkbox'}
                        required={addon.type === 'one' ? true : false}
                        className="size-5 focus:ring-0 accent-[#e85c41]"
                        onChange={() => {
                          handleAddonItemChange(i, j)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="p-2">
            <div className="font-bold">Notes</div>
            <FormTextarea
              id="notes"
              name="notes"
              placeholder="Add any notes here..."
              rows={3}
              defaultValue=""
              aria-describedby="description-error"
              className="focus:ring-0"
              onChange={(e) => {
                setNoteState(e.target.value)
              }}
            />
          </div>
        </div>

        <div className="sticky z-25 bottom-0 flex flex-col bg-[#ffecb6] p-4">
          <div className="flex justify-between">
            <div>Item Qty</div>
            <div className="flex gap-2">
              <MinusIcon
                className={`border-[#2a3990] border-2 rounded-md select-none ${
                  qtyState <= 1
                    ? 'bg-gray-300 opacity-50'
                    : 'cursor-pointer active:bg-gray-400'
                }`}
                onClick={() => handleUpDown(-1)}
              />
              <p>{qtyState}</p>
              <PlusIcon
                className={`border-[#2a3990] border-2 rounded-md select-none ${
                  qtyState >= 15
                    ? 'bg-gray-300 opacity-50'
                    : 'cursor-pointer active:bg-gray-400'
                }`}
                onClick={() => handleUpDown(1)}
              />
            </div>
          </div>

          <Button className="bg-[#2a3990] mt-2 font-bold" onClick={handleClick}>
            {isEdit ? `Save Changes - ` : `Add to Cart - `}
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
            }).format(totalPrice)}
          </Button>
          {isEdit ? (
            <Button
              className="bg-transparent border-red-400 border-1 mt-2 text-red-400 hover:bg-transparent font-bold"
              onClick={handleRemove}
            >
              Remove Item
            </Button>
          ) : null}
        </div>
      </div>
    </CSSTransition>
  )
}
