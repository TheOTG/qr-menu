'use client'
import { useState, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { CustomerCatalog } from '@/lib/dal'
import ProductCard from './ProductCard'
import CatalogNavigation from './CatalogNavigation'
import ProductModal from './ProductModal'
import { Product } from '@/db/schema'
import Link from 'next/link'

interface Props {
  tableInfo: { id: number; tableNumber: number }
  catalog: CustomerCatalog[]
}

const Menu = ({ tableInfo, catalog = [] }: Props) => {
  const [catalogState, setCatalogState] = useState(catalog)
  const [currentCatalog, setCurrentCatalog] = useState(catalog[0])
  const [isModalShowing, setIsModalShowing] = useState(false)
  const [currentProduct, setCurrentProduct] = useState({} as Product)
  const [cartItemState, setCartItemState] = useState([] as any)

  const handleClickNav = (id: number) => {
    for (let i = 0; i < catalogState.length; i++) {
      if (catalogState[i].id === id) {
        catalogState[i].is_selected = true
        setCurrentCatalog({ ...catalogState[i] })
      } else {
        catalogState[i].is_selected = false
      }
    }
    setCatalogState([...catalogState])
  }

  const handleProductModal = (product: Product) => {
    setIsModalShowing(!isModalShowing)
    setCurrentProduct(product)
  }

  const checkCartItems = () => {
    const cartItems = localStorage.getItem('cart_items') || '[]'
    const parsed = JSON.parse(cartItems)
    if (parsed.length) {
      parsed.forEach((z: any, i: number) => {
        z.cartId = i
      })
    }

    setCartItemState([...parsed])
    localStorage.setItem('cart_items', JSON.stringify(parsed))
  }

  useEffect(() => {
    checkCartItems()
    localStorage.setItem('table_info', JSON.stringify(tableInfo))
  }, [])

  return (
    <div className="max-w-md min-h-screen mx-auto bg-[#f9f3e3]">
      <div className="sticky top-0 z-10">
        {/* Header */}
        <div className="bg-[#e85c41] p-4 pb-6">
          <div className="text-white mb-4">
            <h1 className="text-2xl font-bold">
              Table number: {tableInfo.tableNumber}
            </h1>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <div className="w-6 h-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
              </div>
              <span className="font-medium">
                Kelapa Gading Sayapsuci Coffee
              </span>
              <ChevronDown size={18} />
            </div>
            <button className="bg-[#f9e9c7] p-2 rounded-md">
              <Search className="text-black" size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <CatalogNavigation catalog={catalogState} onClick={handleClickNav} />
      </div>

      <div className="relative">
        {/* Promo Banner */}
        <div className="bg-[#2a3990] p-4 m-4 rounded-lg text-center">
          <h2 className="text-white text-2xl font-bold">
            <span className="block">MORNING</span>
            <span className="text-[#ffd100]">COFFEE</span>
          </h2>
          <div className="bg-[#ffd100] text-[#2a3990] text-xs font-bold rounded-full px-3 py-1 inline-block mt-1">
            PROMO 10AM-12PM
          </div>
        </div>

        {/* Product List */}
        {currentCatalog.category_list_with_products.map((category, i) => {
          return (
            <div key={i} className="p-4 border-b-1 border-gray-400">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{category.name}</h3>
                <span className="text-gray-500 text-sm">
                  {category.product_list.length} items found
                </span>
              </div>

              {/* Coffee Items */}
              <div className="flex flex-col gap-4">
                {category.product_list.map((product, j) => {
                  return (
                    <ProductCard
                      key={j}
                      product={product as Product}
                      handleProductModal={handleProductModal}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}

        <ProductModal
          isShowing={isModalShowing}
          cartId={0}
          qty={1}
          product={currentProduct}
          isEdit={false}
          checkCartItems={checkCartItems}
          onClose={() => {
            setIsModalShowing(false)
            setCurrentProduct({} as Product)
          }}
        />
      </div>

      {/* Footer */}
      {cartItemState.length ? (
        <div className="sticky flex bottom-0 max-w-md z-20 p-3">
          <Link
            href="/my-order"
            className="bg-[#2a3990] grow p-3 flex justify-center gap-6 rounded-xl text-white font-bold"
          >
            <p>Proceed to Payment</p>
            <p>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(
                cartItemState.reduce((a: any, b: any) => a + b.totalPrice, 0)
              )}
            </p>
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default Menu
