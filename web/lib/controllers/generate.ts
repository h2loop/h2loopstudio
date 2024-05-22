import fs from 'fs/promises'
import { getUserInfoFromSessionToken } from '@/lib/middlewares/auth'
import {
  enqueueDatasheetCodeGenerationJob,
  enqueueDeviceTreeGenerationJob,
} from '@/lib/queue/pub/events'
import type { ApiRes } from '@/types/api'
import { createId } from '@paralleldrive/cuid2'
import formidable from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'
import pdfParse from 'pdf-parse'

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

const getTextFromPdf = async (pdfFile: formidable.File) => {
  const dataBuffer = await fs.readFile(pdfFile.filepath)
  const pdfResult = await pdfParse(dataBuffer)
  return `PDF TITLE: ${pdfResult.info?.Title} \n\n Author: ${pdfResult.info?.Author} \n\n Content: \n${pdfResult.text}`
}

export const parseHardwareSchematicsAndSendDeviceTreeGenerationJob = async (
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

    const texts = await Promise.all(
      files.map((file) => fs.readFile(file.filepath))
    )
    const pdfTexts = texts.map((e) => e.toString('base64'))

    enqueueDeviceTreeGenerationJob({
      request_id: uniqueId,
      pdfs: pdfTexts,
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

export const generateCodeFromDatasheet = async (
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

    const texts = await Promise.all(files.map((file) => getTextFromPdf(file)))
    const pdfText = texts.join('\n\n')

    enqueueDatasheetCodeGenerationJob({
      datasheet_id: uniqueId,
      datasheet_content: pdfText,
      additional_instruction: additionalInstruction,
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
