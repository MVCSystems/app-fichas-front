'use client'

import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Account</h3>
        <p className='text-muted-foreground text-sm'>
          Update your account settings.
        </p>
      </div>
      <AccountForm />
    </div>
  )
}
