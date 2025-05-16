import { createCatalog } from '../actions/catalogs'
import { PlusIcon, Search, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { Catalog } from '@/db/schema'
interface Props {
  catalog: Catalog
}

export default async function AdminCatalog(props: Props) {
  const { name, categoryList, showAll } = props.catalog
  return <div className="max-w-md h-screen mx-auto bg-[#f9f3e3]"></div>
}
