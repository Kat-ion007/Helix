import { create } from "zustand"
import { UserRole, UserStatus } from "@/types"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

interface UserStore {
  profile: UserProfile | null
  setProfile: (profile: UserProfile | null) => void
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}))
