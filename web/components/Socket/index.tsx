import {
  ASSET_DELETE_FAILED,
  ASSET_DELETING,
  ASSET_INGESTING,
  ASSET_INGESTION_FAILED,
  ASSET_INGESTION_SUCCESS,
} from '@/constants'
import {
  ASSET_STATUS_EVENT,
  CHAT_QUERY_REPLY_EVENT,
  DATASHEET_REPLY_EVENT,
  DEBUG_REPLY_EVENT,
  DEVICETREE_REPLY_EVENT,
  SOCKET_CONNECTION_MESSAGE,
} from '@/lib/socket/events'
import useStore from '@/store'
import { showNotification } from '@mantine/notifications'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import io from 'socket.io-client'

const SocketConnector = () => {
  const { data: session } = useSession()
  const socket = useStore((state) => state.socket)
  const setSocket = useStore((state) => state.setSocket)
  const updateAssetStatus = useStore((state) => state.updateAssetStatus)
  const deleteAsset = useStore((state) => state.deleteAsset)
  const addMessage = useStore((state) => state.addMessage)
  const setDatasheetFiles = useStore((state) => state.setDatasheetFiles)
  const setDevicetreeResponse = useStore((state) => state.setDevicetreeResponse)
  const setDebugResponse = useStore((state) => state.setDebugResponse)
  // const activeChat = useStore((state) => state.activeChat)

  const connectSocket = async (session: Session) => {
    const res = await fetch('/api/socket')

    if (!res.ok) {
      console.error('WebSocket server is not running...')
      return
    }

    const newSocket = io({
      retries: 10,
      ackTimeout: 10000,
    })

    newSocket.on('connect', () => {
      console.log('Websocket connected')
      newSocket.emit(SOCKET_CONNECTION_MESSAGE, {
        userId: session?.user?.email,
      })
    })

    newSocket.on(DATASHEET_REPLY_EVENT, ({ files }) => {
      setDatasheetFiles(files)
    })

    newSocket.on(DEVICETREE_REPLY_EVENT, ({ response }) => {
      setDevicetreeResponse(response)
    })

    newSocket.on(DEBUG_REPLY_EVENT, ({ response }) => {
      console.log(response, 'debug response')
      setDebugResponse(response)
    })

    newSocket.on(ASSET_STATUS_EVENT, ({ assetId, status }) => {
      if (status) {
        if (status === ASSET_INGESTION_SUCCESS) {
          showNotification({
            message: 'Asset ingested successfully!',
            color: 'green',
          })
        } else if (status === ASSET_INGESTION_FAILED) {
          showNotification({
            message: 'Asset ingestion failed!',
            color: 'red',
          })
        } else if (status === ASSET_INGESTING) {
          showNotification({
            message: 'Asset ingestion started!',
            color: 'blue',
          })
        } else if (status === 'deleted') {
          showNotification({
            message: 'Asset deleted successfully!',
            color: 'green',
          })
        } else if (status === ASSET_DELETING) {
          showNotification({
            message: 'Asset deletion started!',
            color: 'info',
          })
        } else if (status === ASSET_DELETE_FAILED) {
          showNotification({
            message: 'Asset deletion failed!',
            color: 'red',
          })
        } else {
          return
        }

        status === 'deleted'
          ? deleteAsset(assetId)
          : updateAssetStatus(assetId, status)
      }
    })

    newSocket.on(
      CHAT_QUERY_REPLY_EVENT,
      ({ chatId, messageId, timestamp, response, complete, sources }) => {
        addMessage({
          chatId: chatId,
          id: messageId,
          timestamp: timestamp || new Date(),
          content: response,
          isResponse: true,
          complete: complete,
          sources: sources,
        })
      }
    )

    setSocket(newSocket)

    // Cleanup function
    return () => {
      console.log('Websocket disconnected')
      newSocket.disconnect()
    }
  }

  useEffect(() => {
    if ((!socket || !socket.connected) && session) {
      connectSocket(session)
      // const cleanupPromise = connectSocket(session)
      // cleanup function when component unmounts
      // return () => {
      //   cleanupPromise.then((cleanup) => cleanup && cleanup())
      // }
    }
  }, [session])

  return null
}

export default SocketConnector
