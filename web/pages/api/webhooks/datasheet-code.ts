import { config as appConfig } from '@/config'
import { sendDatasheetResponse } from '@/lib/socket/datasheet'
import type { ApiRes } from '@/types/api'
import { NextApiRequest } from 'next'
import type { NextApiResponseWithSocket } from '../socket'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponseWithSocket<ApiRes<string>>
) => {
  switch (req.method) {
    case 'PUT': {
      const apiKey = req.body.apiKey as string
      const user = req.body.user as string
      const files: any[] = req.body.files
      const datasheetId = req.body.datasheetId as string

      if (apiKey != appConfig.serviceApiKey) {
        return res.status(401).json({ success: false })
      }

      // Notify user on the status
      const io = res.socket.server.io
      if (io) await sendDatasheetResponse(io, user, { datasheetId, files })

      res.status(201).json({
        success: true,
        data: '',
      })
      break
    }
    default:
      res.status(405).json({
        success: true,
        error: 'Method not allowed',
      })
      break
  }
}

export default handler
