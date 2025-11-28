'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  const router = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium'>Forbidden</span>
        <p className='text-muted-foreground text-center'>
          You do not have permission to access this resource.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push('/dashboard')}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
