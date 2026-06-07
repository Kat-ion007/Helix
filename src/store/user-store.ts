import { create } from "zustand"
import { UserRole } from "@/types"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
}

interface UserStore {
  profile: UserProfile | null
  setProfile: (profile: UserProfile | null) => void
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}))
