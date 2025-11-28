'use client'

import { NotificationsForm } from './notifications-form'

export function SettingsNotifications() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Notifications</h3>
        <p className='text-muted-foreground text-sm'>
          Configure how you receive notifications.
        </p>
      </div>
      <NotificationsForm />
    </div>
  )
}
