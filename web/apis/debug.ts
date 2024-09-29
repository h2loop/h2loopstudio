import fetcher from '@/lib/utils/fetcher';

export const uploadDebugLogApi = async (logText: string) => {  
  const formData = new FormData()
  formData.append("log", logText);
  const res = await fetcher.post(
    `/api/debug`,
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
