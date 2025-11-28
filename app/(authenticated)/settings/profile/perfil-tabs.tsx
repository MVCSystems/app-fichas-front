'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type PerfilUsuario } from './schema'
import { PerfilGeneral } from './perfil-general'
import { PerfilSeguridad } from './perfil-seguridad'
import { PerfilMFA } from './perfil-mfa'
import { User, Shield, Lock } from 'lucide-react'

type PerfilTabsProps = {
  perfil: PerfilUsuario
  onUpdate: () => void
}

export function PerfilTabs({ perfil, onUpdate }: PerfilTabsProps) {
  return (
    <Tabs defaultValue='general' className='w-full'>
      <TabsList className='grid w-full grid-cols-3 lg:w-[400px]'>
        <TabsTrigger value='general' className='gap-2'>
          <User className='h-4 w-4' />
          <span className='hidden sm:inline'>General</span>
        </TabsTrigger>
        <TabsTrigger value='seguridad' className='gap-2'>
          <Shield className='h-4 w-4' />
          <span className='hidden sm:inline'>Seguridad</span>
        </TabsTrigger>
        <TabsTrigger value='mfa' className='gap-2'>
          <Lock className='h-4 w-4' />
          <span className='hidden sm:inline'>MFA</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value='general' className='mt-6'>
        <PerfilGeneral perfil={perfil} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value='seguridad' className='mt-6'>
        <PerfilSeguridad perfil={perfil} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value='mfa' className='mt-6'>
        <PerfilMFA perfil={perfil} onUpdate={onUpdate} />
      </TabsContent>
    </Tabs>
  )
}
