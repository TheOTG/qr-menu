export interface CartItem {
  id: number
  cartId: number
  name: string
  image: string | null
  thumbnail: string | null
  description: string
  notes: string
  price: number
  totalPrice: number
  qty: number
  addons: {
    name: string
    type: 'one' | 'multiple'
    items: {
      name: string
      price: number
      isSelected: boolean
    }[]
  }[]
}
