'use client'

import { ChangeEvent, useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/db/schema'
import Button from './ui/Button'
import {
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormError,
} from './ui/Form'
import {
  createProduct,
  updateProduct,
  type ActionResponse,
} from '@/app/actions/products'
import { ChevronUpIcon, ChevronDownIcon, XIcon, Check } from 'lucide-react'
import ColumnInput from './ColumnInput'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

interface ProductFormProps {
  product?: Product
  isEditing?: boolean
  nextId: number
  addonNextId: number
}

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
  error: undefined,
}

export default function ProductForm({
  product,
  isEditing = false,
  nextId = 1,
  addonNextId = 1,
}: ProductFormProps) {
  const router = useRouter()
  const [addonIdState, setAddonIdState] = useState(nextId)
  const [addonListIdState, setAddonListIdState] = useState(addonNextId)
  const [addonState, setAddonState] = useState<any[]>(product?.addons || [])
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 100,
      },
    })
  )

  const getItemPos = (addonIdx: number, id: UniqueIdentifier) => {
    return addonState[addonIdx].items.findIndex((addon: any) => addon.id === id)
  }

  const getAddonIdx = (addonId: UniqueIdentifier) => {
    return addonState.findIndex((category: any) => category.id === addonId)
  }

  const handleDragEnd = (event: DragEndEvent, categoryId: number) => {
    const { active, over } = event

    if (active.id === over?.id) return

    const addonIdx = getAddonIdx(categoryId)
    const originalPos = getItemPos(addonIdx, active.id)
    const newPos = getItemPos(addonIdx, over?.id || '')

    addonState[addonIdx].items = arrayMove(
      addonState[addonIdx].items,
      originalPos,
      newPos
    )

    setAddonState([...addonState])
  }

  const handleUpDownClick = (id: number, offset: number) => {
    const originalPos = getAddonIdx(id)

    setAddonState([...arrayMove(addonState, originalPos, originalPos + offset)])
  }

  const handleClick = () => {
    setAddonState([
      ...addonState,
      { name: '', type: 'one', items: [], id: addonIdState },
    ])
    setAddonIdState(addonIdState + 1)
  }

  const handleAddAddon = (addonId: number) => {
    const addonIdx = getAddonIdx(addonId)
    addonState[addonIdx].items.push({
      name: '',
      price: 0,
      id: addonListIdState,
    })
    setAddonState([...addonState])
    setAddonListIdState(addonListIdState + 1)
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    itemId: number,
    addonId: number
  ) => {
    const { name, value } = e.target
    const splitName = name.split('-')
    const key = splitName[0] as 'name' | 'price'
    const addonIdx = getAddonIdx(addonId)
    for (let i = 0; i < addonState[addonIdx].items.length; i++) {
      if (addonState[addonIdx].items[i].id === itemId) {
        if (key === 'name') {
          addonState[addonIdx].items[i][key] = value
        } else if (key === 'price') {
          const parsed = parseInt(value)
          addonState[addonIdx].items[i][key] = isNaN(parsed) ? 0 : parsed
        }
        break
      }
    }
    setAddonState([...addonState])
  }

  const handleAddonChange = (
    e: ChangeEvent<HTMLInputElement>,
    addonId: number
  ) => {
    const addonIdx = getAddonIdx(addonId)
    addonState[addonIdx].name = e.target.value
    setAddonState([...addonState])
  }

  const handleAddonTypeChange = (addonId: number, value: string) => {
    const addonIdx = getAddonIdx(addonId)
    addonState[addonIdx].type = value
    setAddonState([...addonState])
  }

  const handleRemoveAddon = (id: number) => {
    setAddonState((prevAddonState) => {
      return prevAddonState.filter((addon) => addon.id !== id)
    })
  }

  const handleRemoveAddonItem = (itemId: number, addonId: number) => {
    const addonIdx = getAddonIdx(addonId)
    addonState[addonIdx].items = addonState[addonIdx].items.filter(
      (item: any) => item.id !== itemId
    )
    setAddonState([...addonState])
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
        sku: formData.get('sku') as string,
        //   image: formData.get('image') as string,
        //   thumbnail: formData.get('thumbnail') as string,
        description: formData.get('description') as string,
        price: parseInt(formData.get('price') as string) as number,
        useStock: false,
        stock: 0,
        addons: addonState,
      }

      try {
        // Call the appropriate action based on whether we're editing or creating
        const result = isEditing
          ? await updateProduct(Number(product!.id), data)
          : await createProduct(data)

        // Handle successful submission
        if (result.success) {
          router.refresh()
          if (!isEditing) {
            router.push('/admin/products')
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
          placeholder="Product name"
          defaultValue={product?.name || ''}
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
        <FormLabel htmlFor="name">SKU</FormLabel>
        <FormInput
          id="sku"
          name="sku"
          placeholder="Product sku"
          defaultValue={product?.sku || ''}
          required
          minLength={3}
          maxLength={100}
          disabled={isPending}
          aria-describedby="sku-error"
          className={state?.errors?.name ? 'border-red-500' : ''}
        />
        {state?.errors?.name && (
          <p id="sku-error" className="text-sm text-red-500">
            {state.errors.name[0]}
          </p>
        )}
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="price">Price</FormLabel>
        <FormInput
          id="price"
          name="price"
          type="number"
          placeholder="Product price"
          defaultValue={product?.price || 500}
          required
          minLength={3}
          maxLength={100}
          disabled={isPending}
          aria-describedby="price-error"
          className={state?.errors?.price ? 'border-red-500' : ''}
        />
        {state?.errors?.price && (
          <p id="price-error" className="text-sm text-red-500">
            {state.errors.price[0]}
          </p>
        )}
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="description">Description</FormLabel>
        <FormTextarea
          id="description"
          name="description"
          placeholder="Describe the product..."
          rows={4}
          defaultValue={product?.description || ''}
          disabled={isPending}
          aria-describedby="description-error"
          className={state?.errors?.description ? 'border-red-500' : ''}
        />
        {state?.errors?.description && (
          <p id="description-error" className="text-sm text-red-500">
            {state.errors.description[0]}
          </p>
        )}
      </FormGroup>

      <FormGroup>
        <div className="flex content-center gap-4 items-center">
          <FormLabel htmlFor="addons" className="text-center">
            Addons
          </FormLabel>
          <div
            className="bg-green-400 hover:cursor-default hover:bg-gray-500 font-medium h-10 px-4 py-2 text-sm rounded-md text-center"
            onClick={handleClick}
          >
            +Category
          </div>
        </div>
        <ul className="bg-gray-200 rounded-md items-center">
          <ul className="bg-gray-200 rounded-md items-center">
            {addonState.map((addon: any, i: number) => {
              return (
                <li
                  key={addon.id}
                  className="grid grid-cols-12 gap-x-2 p-1 items-center"
                >
                  <div className="col-span-1 flex flex-col place-items-center">
                    {i == 0 ? null : (
                      <ChevronUpIcon
                        className="hover:bg-green-300"
                        onClick={() => {
                          handleUpDownClick(addon.id, -1)
                        }}
                      />
                    )}
                    {i == addonState.length - 1 ? null : (
                      <ChevronDownIcon
                        className="hover:bg-green-300"
                        onClick={() => {
                          handleUpDownClick(addon.id, 1)
                        }}
                      />
                    )}
                  </div>

                  <div className="col-span-5 grid grid-cols-6 gap-2">
                    <FormInput
                      id={`${addon.name}-${addon.id}`}
                      name={`name-${addon.id}`}
                      placeholder="Addon category name"
                      defaultValue={addon.name}
                      required
                      minLength={3}
                      maxLength={100}
                      disabled={isPending}
                      aria-describedby="name-error"
                      className={`col-span-4 ${
                        state?.errors?.name ? 'border-red-500' : ''
                      }`}
                      onChange={(e) => {
                        handleAddonChange(e, addon.id)
                      }}
                    />

                    <div
                      className="col-span-2 bg-amber-400 hover:cursor-default hover:bg-gray-500 font-medium h-10 rounded text-sm -md text-center py-2"
                      onClick={() => {
                        handleAddAddon(addon.id)
                      }}
                    >
                      +addon
                    </div>
                  </div>

                  <div className="col-span-5 grid grid-cols-2 gap-2">
                    <div
                      onClick={() => handleAddonTypeChange(addon.id, 'one')}
                      className={`
                        p-3 rounded-lg border-2 cursor-pointer
                        transition-all duration-200 ease-in-out
                        ${
                          addon.type === 'one'
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-400 hover:border-gray-300 hover:bg-gray-400'
                        }
                      `}
                    >
                      <div className="flex flex-row items-center">
                        <div
                          className={`
                            w-6 h-6 rounded-full flex items-center justify-center mr-2
                            ${
                              addon.type === 'one'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100'
                            }
                          `}
                        >
                          {addon.type === 'one' && (
                            <Check className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-medium">One</span>
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        handleAddonTypeChange(addon.id, 'multiple')
                      }
                      className={`
                        p-3 rounded-lg border-2 cursor-pointer
                        transition-all duration-200 ease-in-out
                        ${
                          addon.type === 'multiple'
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-400 hover:border-gray-300 hover:bg-gray-400'
                        }
                      `}
                    >
                      <div className="flex flex-row items-center">
                        <div
                          className={`
                            w-6 h-6 rounded-full flex items-center justify-center mr-2
                            ${
                              addon.type === 'multiple'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100'
                            }
                          `}
                        >
                          {addon.type === 'multiple' && (
                            <Check className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-medium">Multiple</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 text-center">
                    <XIcon
                      className="hover:bg-red-500 hover:text-white active:bg-red-300 rounded-sm size-5 place-self-center"
                      onClick={() => {
                        handleRemoveAddon(addon.id)
                      }}
                    />
                  </div>

                  <div className="col-span-12 bg-blue-200 rounded-sm mt-1">
                    <DndContext
                      id="dnd-context-id-productform"
                      sensors={sensors}
                      collisionDetection={closestCorners}
                      onDragEnd={(e: DragEndEvent) => {
                        handleDragEnd(e, addon.id)
                      }}
                    >
                      <ColumnInput
                        addonId={addon.id}
                        items={addon.items}
                        handleInputChange={handleInputChange}
                        handleRemoveAddonItem={handleRemoveAddonItem}
                        isPending={isPending}
                      />
                    </DndContext>
                  </div>
                </li>
              )
            })}
          </ul>
        </ul>
      </FormGroup>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </Form>
  )
}
