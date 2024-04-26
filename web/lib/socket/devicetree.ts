import { type Server } from 'socket.io'
import { DEVICETREE_REPLY_EVENT } from './events'
import { emitSocketEventToUser } from './utils'

type IDeviceTreeReply = {
  requestId: string
  response: string
}

export const sendDeviceTreeResponse = async (
  io: Server,
  userId: string,
  payload: IDeviceTreeReply
) => {
  emitSocketEventToUser<IDeviceTreeReply>(
    io,
    userId,
    DEVICETREE_REPLY_EVENT,
    payload
  )
}
