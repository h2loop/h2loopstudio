import { DatasheetSlice } from '@/types/datasheet'
import { StateCreator } from 'zustand'

export const createDatasheetSlice: StateCreator<
  DatasheetSlice,
  [],
  [],
  DatasheetSlice
> = (set) => ({
  datasheetId: '',
  setDatasheetId(id) {
    set({
      datasheetId: id,
    })
  },
  datasheetFiles: [],
  setDatasheetFiles(files) {
    set({
      datasheetFiles: files,
    })
  },
})
