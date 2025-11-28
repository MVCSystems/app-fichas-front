'use client'

import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Appearance</h3>
        <p className='text-muted-foreground text-sm'>
          Customize the appearance of the app.
        </p>
      </div>
      <AppearanceForm />
    </div>
  )
}
