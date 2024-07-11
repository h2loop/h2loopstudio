export interface DatasheetFiles {
  code: string
  language: string
  filename: string
}

export interface DatasheetSlice {
  datasheetId: string
  setDatasheetId: (id: string) => void
  datasheetFiles: DatasheetFiles[]
  setDatasheetFiles: (files: DatasheetFiles[]) => void
}
