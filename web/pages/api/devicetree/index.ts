import fs from 'fs/promises'
import { getUserInfoFromSessionToken } from '@/lib/middlewares/auth'
import { enqueueDeviceTreeGenerationJob } from '@/lib/queue/pub/events'
import type { ApiRes } from '@/types/api'
import { createId } from '@paralleldrive/cuid2'
import formidable from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

type FileUploadResponse = {
  requestId: string
}

const getFilesFromFormData = (files: formidable.Files<string>) => {
  const extractedFiles: formidable.File[] = []
  Object.values(files).forEach((file) => {
    if (file) {
      extractedFiles.push(file[0])
    }
  })
  return extractedFiles
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<FileUploadResponse>>
) => {
  if (req.method === 'POST') {
    const uniqueId = createId()
    const sessionToken = req.headers.sessiontoken as string
    const user = await getUserInfoFromSessionToken(sessionToken)

    const form = formidable({})
    const parsedForm = await form.parse(req)

    const files = getFilesFromFormData(parsedForm[1])
    if (!files || Object.values(files).length <= 0) {
      return res.status(400).send({
        success: false,
        error: 'No file in request',
      })
    }

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'No PDF file provided' })
    }

    const dataBuffers = await Promise.all(
      files.map((file) => fs.readFile(file.filepath))
    )
    const pdfBase64 = dataBuffers.map((e) => e.toString('base64'))

    enqueueDeviceTreeGenerationJob({
      request_id: uniqueId,
      pdfs: pdfBase64,
      user: user?.email || '',
    })

    return res.status(201).send({
      success: true,
      data: {
        requestId: uniqueId,
      },
    })
  }
}
