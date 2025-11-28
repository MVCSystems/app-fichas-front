import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Empleado } from '../data/schema'

type EmpleadosDialogType = 'add' | 'edit' | 'delete'

type EmpleadosContextType = {
  open: EmpleadosDialogType | null
  setOpen: (str: EmpleadosDialogType | null) => void
  currentRow: Empleado | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Empleado | null>>
  refetch?: () => void
}

const EmpleadosContext = React.createContext<EmpleadosContextType | null>(null)

export function EmpleadosProvider({ 
  children,
  refetch
}: { 
  children: React.ReactNode
  refetch?: () => void
}) {
  const [open, setOpen] = useDialogState<EmpleadosDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Empleado | null>(null)

  return (
    <EmpleadosContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, refetch }}>
      {children}
    </EmpleadosContext.Provider>
  )
}

export const useEmpleados = () => {
  const context = React.useContext(EmpleadosContext)

  if (!context) {
    throw new Error('useEmpleados has to be used within <EmpleadosProvider>')
  }

  return context
}


