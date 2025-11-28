import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Area } from '../data/schema'

type AreasDialogType = 'add' | 'edit' | 'delete'

type AreasContextType = {
  open: AreasDialogType | null
  setOpen: (str: AreasDialogType | null) => void
  currentRow: Area | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Area | null>>
  refetch?: () => void
}

const AreasContext = React.createContext<AreasContextType | null>(null)

export function AreasProvider({ 
  children,
  refetch
}: { 
  children: React.ReactNode
  refetch?: () => void
}) {
  const [open, setOpen] = useDialogState<AreasDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Area | null>(null)

  return (
    <AreasContext value={{ open, setOpen, currentRow, setCurrentRow, refetch }}>
      {children}
    </AreasContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAreas = () => {
  const areasContext = React.useContext(AreasContext)

  if (!areasContext) {
    throw new Error('useAreas has to be used within <AreasContext>')
  }

  return areasContext
}
