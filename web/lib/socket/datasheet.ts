import { type Server } from 'socket.io'
import { DATASHEET_REPLY_EVENT } from './events'
import { emitSocketEventToUser } from './utils'

type IDatasheetQueryReply = {
  datasheetId: string
  files: any[]
}

export const sendDatasheetResponse = async (
  io: Server,
  userId: string,
  payload: IDatasheetQueryReply
) => {
  console.log({ payload })
  emitSocketEventToUser<IDatasheetQueryReply>(
    io,
    userId,
    DATASHEET_REPLY_EVENT,
    payload
  )
}
