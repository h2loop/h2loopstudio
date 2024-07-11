import fetcher from '@/lib/utils/fetcher'
import { FileWithPath } from '@mantine/dropzone'

export const uploadHardwareSchematicsApi = async (files: FileWithPath[]) => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`file${index}`, file)
  })
  const res = await fetcher.post(
    `/api/devicetree`,
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
