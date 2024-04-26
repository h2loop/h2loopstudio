import { DevicetreeSlice } from '@/types/devicetree'
import { StateCreator } from 'zustand'

export const createDeviceTreeSlice: StateCreator<
  DevicetreeSlice,
  [],
  [],
  DevicetreeSlice
> = (set) => ({
  devicetreeResponse: '',
  setDevicetreeResponse(res) {
    set({
      devicetreeResponse: res,
    })
  },
})
