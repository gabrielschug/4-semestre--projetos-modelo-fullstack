import type { AdminType } from '../utils/AdminType'
import { create } from 'zustand'

type AdminStore = {
    admin: AdminType
    token: string

    logaAdmin: (adminLogado: AdminType, token: string) => void
    deslogaAdmin: () => void
}

export const useAdminStore = create<AdminStore>((set) => ({
    admin: {} as AdminType,
    token: '',
    logaAdmin: (adminLogado, token) => set({ admin: adminLogado, token }),
    deslogaAdmin: () => set({ admin: {} as AdminType, token: '' })
}))
