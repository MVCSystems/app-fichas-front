"use client"

import React from 'react'
import { cn } from '@/lib/utils'

type MainProps = {
  children?: React.ReactNode
  className?: string
  title?: string
  fixed?: boolean
}

export function Main({ children, className, title, fixed }: MainProps) {
  return (
    <main className={cn('flex-1 flex flex-col p-4 sm:p-6', fixed ? 'h-full' : '', className)}>
      {title ? (
        <div className="mb-4">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      ) : null}
      {children}
    </main>
  )
}
