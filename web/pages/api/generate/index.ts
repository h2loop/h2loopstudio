import fs from 'fs/promises'
import { getUserInfoFromSessionToken } from '@/lib/middlewares/auth'
import { enqueueDatasheetCodeGenerationJob } from '@/lib/queue/pub/events'
import type { ApiRes } from '@/types/api'
import { createId } from '@paralleldrive/cuid2'
import formidable from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'
import pdfParse from 'pdf-parse'

export const config = {
  api: {
    bodyParser: false,
  },
}

type FileUploadResponse = {
  datasheetId: string
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
    const additionalInstruction = parsedForm[0]?.additionalInstruction
      ? parsedForm[0]?.additionalInstruction[0]
      : ''

    const files = getFilesFromFormData(parsedForm[1])
    const pdfFile = files[0]

    if (!pdfFile) {
      return res
        .status(400)
        .json({ success: false, error: 'No PDF file provided' })
    }

    const dataBuffer = await fs.readFile(pdfFile.filepath)
    const text = await pdfParse(dataBuffer)
    const pdfText = text.text

    if (!files || Object.values(files).length <= 0) {
      return res.status(400).send({
        success: false,
        error: 'No file in request',
      })
    }

    enqueueDatasheetCodeGenerationJob({
      datasheet_id: uniqueId,
      datasheet_content: pdfText,
      additional_instruction: additionalInstruction,
      user: user?.email || '',
    })

    return res.status(201).send({
      success: true,
      data: {
        datasheetId: uniqueId,
      },
    })
  }
}
