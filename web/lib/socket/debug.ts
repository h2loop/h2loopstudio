import { type Server } from 'socket.io'
import { DEBUG_REPLY_EVENT } from './events'
import { emitSocketEventToUser } from './utils'

type IDebugResponse = {
  requestId: string
  response: string
}

export const sendDebugResponse = async (
  io: Server,
  userId: string,
  payload: IDebugResponse
) => {
  emitSocketEventToUser<IDebugResponse>(
    io,
    userId,
    DEBUG_REPLY_EVENT,
    payload
  )
}
