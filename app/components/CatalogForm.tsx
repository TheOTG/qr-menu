'use client'

import { ChangeEvent, useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Catalog } from '@/db/schema'
import Button from './ui/Button'
import { Form, FormGroup, FormLabel, FormInput, FormError } from './ui/Form'
import {
  createCatalog,
  updateCatalog,
  type ActionResponse,
} from '@/app/actions/catalogs'
import { ChevronUpIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import Select from 'react-select'
import Column from './Column'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

interface Product {
  id: number
  name: string
}

interface CatalogFormProps {
  catalog?: Catalog | null | undefined
  isEditing?: boolean
  nextId: number
  productList: Product[]
}

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
  error: undefined,
}

export default function CatalogForm({
  catalog,
  isEditing = false,
  nextId = 1,
  productList = [],
}: CatalogFormProps) {
  const router = useRouter()
  const [categoryIdState, setCategoryIdState] = useState(nextId)
  const [categoryState, setCategoryState] = useState<any>(
    catalog?.categoryList || []
  )
  const [productListOption, setProductListOption] = useState(() =>
    productList.map((product) => {
      return { label: product.name, value: product.id.toString() }
    })
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getItemPos = (categoryIdx: number, id: UniqueIdentifier) => {
    return categoryState[categoryIdx].product_list.findIndex(
      (product: any) => product.id === id
    )
  }

  const getCategoryIdx = (categoryId: UniqueIdentifier) => {
    return categoryState.findIndex(
      (category: any) => category.id === categoryId
    )
  }

  const handleDragEnd = (event: DragEndEvent, categoryId: number) => {
    const { active, over } = event

    if (active.id === over?.id) return

    const categoryIdx = getCategoryIdx(categoryId)
    const originalPos = getItemPos(categoryIdx, active.id)
    const newPos = getItemPos(categoryIdx, over?.id || '')

    categoryState[categoryIdx].product_list = arrayMove(
      categoryState[categoryIdx].product_list,
      originalPos,
      newPos
    )

    setCategoryState([...categoryState])
  }

  const handleClick = () => {
    setCategoryState([
      ...categoryState,
      { name: '', product_list: [], id: categoryIdState },
    ])
    setCategoryIdState(categoryIdState + 1)
  }

  const handleUpDownClick = (id: number, offset: number) => {
    const originalPos = getCategoryIdx(id)

    setCategoryState([
      ...arrayMove(categoryState, originalPos, originalPos + offset),
    ])
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const splitName = name.split('-')
    const id = parseInt(splitName[1])
    for (let i = 0; i < categoryState.length; i++) {
      if (categoryState[i].id === id) {
        categoryState[i].name = value
        break
      }
    }
    setCategoryState([...categoryState])
  }

  const handleRemoveCategory = (id: number) => {
    setCategoryState((prevCategoryState: any) => {
      return prevCategoryState.filter((category: any) => category.id !== id)
    })
  }

  const handleSelectChange = (e: any, categoryId: number) => {
    for (let i = 0; i < categoryState.length; i++) {
      if (categoryState[i].id === categoryId) {
        categoryState[i].product_list = e.map((z: any) => {
          return {
            id: parseInt(z.value),
            name: z.label,
          }
        })
        setCategoryState([...categoryState])
        break
      }
    }
  }

  // Use useActionState hook for the form submission action
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(
    async (
      prevState: ActionResponse,
      formData: FormData
    ): Promise<ActionResponse> => {
      // Extract data from form
      const data = {
        name: formData.get('name') as string,
        categoryList: categoryState.map((category: any) => {
          return {
            name: category.name,
            productList: category.product_list.map(
              (product: Product) => product.id
            ),
          }
        }),
      }

      try {
        // Call the appropriate action based on whether we're editing or creating
        const result = isEditing
          ? await updateCatalog(Number(catalog!.id), data)
          : await createCatalog(data)

        // Handle successful submission
        if (result.success) {
          router.refresh()
          if (!isEditing) {
            router.push('/admin/catalogs')
          }
        }

        return result
      } catch (err) {
        return {
          success: false,
          message: (err as Error).message || 'An error occurred',
          errors: undefined,
        }
      }
    },
    initialState
  )

  return (
    <Form action={formAction}>
      {state?.message && (
        <FormError
          className={`mb-4 ${
            state.success ? 'bg-green-100 text-green-800 border-green-300' : ''
          }`}
        >
          {state.message}
        </FormError>
      )}

      <FormGroup>
        <FormLabel htmlFor="name">Name</FormLabel>
        <FormInput
          id="name"
          name="name"
          placeholder="Catalog name"
          defaultValue={catalog?.name || ''}
          required
          minLength={3}
          maxLength={100}
          disabled={isPending}
          aria-describedby="name-error"
          className={state?.errors?.name ? 'border-red-500' : ''}
        />
        {state?.errors?.name && (
          <p id="name-error" className="text-sm text-red-500">
            {state.errors.name[0]}
          </p>
        )}
      </FormGroup>

      <FormGroup>
        <div className="flex content-center gap-4 items-center">
          <FormLabel htmlFor="categories" className="text-center">
            Categories
          </FormLabel>
          <div
            className="bg-gray-400 hover:cursor-default hover:bg-gray-500 font-medium h-10 px-4 py-2 text-sm rounded-md text-center"
            onClick={handleClick}
          >
            +
          </div>
        </div>
        <ul className="bg-gray-200 rounded-md items-center">
          {categoryState.map((category: any, i: number) => {
            return (
              <li
                key={category.id}
                className="grid grid-cols-14 gap-x-2 p-1 items-center"
              >
                <div className="col-span-1 flex flex-col place-items-center">
                  {i == 0 ? null : (
                    <ChevronUpIcon
                      className="hover:bg-green-300"
                      onClick={() => {
                        handleUpDownClick(category.id, -1)
                      }}
                    />
                  )}
                  {i == categoryState.length - 1 ? null : (
                    <ChevronDownIcon
                      className="hover:bg-green-300"
                      onClick={() => {
                        handleUpDownClick(category.id, 1)
                      }}
                    />
                  )}
                </div>

                <FormInput
                  id={`${category.name}-${category.id}`}
                  name={`name-${category.id}`}
                  placeholder="Category name"
                  defaultValue={category.name}
                  required
                  minLength={3}
                  maxLength={100}
                  disabled={isPending}
                  aria-describedby="name-error"
                  className={`col-span-4 ${
                    state?.errors?.name ? 'border-red-500' : ''
                  }`}
                  onChange={handleInputChange}
                />

                <Select
                  instanceId={category.id}
                  name={`selectProducts-${category.id}`}
                  id={category.id}
                  className="col-span-8 basic-multi-select"
                  classNamePrefix="select"
                  defaultValue={
                    catalog
                      ? category.product_list.map((product: any) => {
                          return {
                            label: product.name,
                            value: product.id.toString(),
                          }
                        })
                      : null
                  }
                  isMulti
                  options={productListOption}
                  onChange={(e: any) => {
                    handleSelectChange(e, category.id)
                  }}
                  closeMenuOnSelect={false}
                />

                <XIcon
                  className="hover:bg-red-500 hover:text-white active:bg-red-300 rounded-sm size-5 place-self-center mr-3"
                  onClick={() => {
                    handleRemoveCategory(category.id)
                  }}
                />
                <div className="bg-blue-200 col-span-14 rounded-sm mt-1">
                  <DndContext
                    id="dnd-context-id-catalogform"
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={(e: DragEndEvent) => {
                      handleDragEnd(e, category.id)
                    }}
                  >
                    <Column items={category.product_list} />
                  </DndContext>
                </div>
              </li>
            )
          })}
        </ul>
      </FormGroup>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="primary"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? 'Update Catalog' : 'Create Catalog'}
        </Button>
      </div>
    </Form>
  )
}
