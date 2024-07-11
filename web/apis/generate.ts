import fetcher from '@/lib/utils/fetcher'
import { FileWithPath } from '@mantine/dropzone'

export const uploadDatasheetApi = async (
  files: FileWithPath[],
  additionalInstruction: string = ''
) => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`file${index}`, file)
  })
  formData.append('additionalInstruction', additionalInstruction)
  const res = await fetcher.post(
    `/api/generate`,
    {},
    {
      body: formData,
    }
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}
