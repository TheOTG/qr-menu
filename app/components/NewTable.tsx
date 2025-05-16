'use client'
import { PlusIcon } from 'lucide-react'
import Button from './ui/Button'
import { createTable, type ActionResponse } from '../actions/tables'
import { useState } from 'react'
import { mockDelay } from '@/lib/utils'

export default function NewTable() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await createTable()
    } catch (error) {
      console.log(error, '==error when creating table')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      isLoading={isLoading}
      className="bg-indigo-500"
    >
      <span className="flex items-center gap-1">
        <PlusIcon size={18} />
        New Table
      </span>
    </Button>
  )
}
