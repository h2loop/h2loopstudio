import { DebugSlice } from '@/types/debug'
import { StateCreator } from 'zustand'

export const createDebugSlice: StateCreator<
  DebugSlice,
  [],
  [],
  DebugSlice
> = (set) => ({
  debugResponse: '',
  setDebugResponse(res) {
    set({
      debugResponse: res,
    })
  },
})
