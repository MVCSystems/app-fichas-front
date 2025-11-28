"use client"

import React from 'react'
import { cn } from '@/lib/utils'

type MainProps = {
  children?: React.ReactNode
  className?: string
}

export function Main({ children, className }: MainProps) {
  return (
    <main className={cn('flex-1 flex flex-col p-4 sm:p-6', className)}>
      {children}
    </main>
  )
}
