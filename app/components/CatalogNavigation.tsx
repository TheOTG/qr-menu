interface Props {
  catalog: {
    id: number
    name: string
    is_selected: boolean
  }[]
  onClick: (id: number) => void
}
const CatalogNavigation = ({ catalog, onClick }: Props) => {
  return (
    <div className="flex border-b border-gray-300 bg-[#e85c41]">
      {catalog.map((cat) => {
        return (
          <button
            key={cat.id.toString()}
            onClick={() => {
              onClick(cat.id)
            }}
            className={`px-4 py-2 ${
              cat.is_selected
                ? 'text-white font-medium border-b-2 border-white'
                : 'text-gray-300'
            }`}
          >
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}

export default CatalogNavigation
