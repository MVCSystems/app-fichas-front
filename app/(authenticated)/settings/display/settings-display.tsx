'use client'

import { DisplayForm } from './display-form'

export function SettingsDisplay() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Display</h3>
        <p className='text-muted-foreground text-sm'>
          Customize display and layout settings.
        </p>
      </div>
      <DisplayForm />
    </div>
  )
}
