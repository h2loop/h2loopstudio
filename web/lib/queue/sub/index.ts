import { config } from '@/config'
import {
  handleAssetStatus,
  handleChatResponse,
  handleDatasheetCode,
  handleDocStatus,
} from '@/lib/queue/sub/handlers'
import Redis from 'ioredis'
import { handleDeviceTreeResponse } from './handlers/devicetree'
import {
  ASSET_INGESTION_STATUS,
  DATASHEET_RESPONSE,
  DEVICETREE_RESPONSE,
  DOC_STATUS,
  QUERY_RESPONSE,
} from './topics'

type ITopicCallbacks = Record<string, (message: string) => Promise<void>>

const redis = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  maxRetriesPerRequest: null,
})

export const processMessageFromQueue = async (
  queue: string,
  topics: ITopicCallbacks
) => {
  console.log(`Registered topics -> ${Object.keys(topics)}`)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await redis.blpop(queue, 0.05)
    if (result) {
      const message = JSON.parse(result[1])
      const callback = topics[message.topic]
      if (callback) {
        callback(message.data)
      }
    }
  }
}

export const startConsuming = () => {
  const ingestionTopicsHandlers = {
    [DOC_STATUS]: handleDocStatus,
    [ASSET_INGESTION_STATUS]: handleAssetStatus,
  }

  const queryTopicsHandlers = {
    [QUERY_RESPONSE]: handleChatResponse,
  }

  const datasheetTopicsHandlers = {
    [DATASHEET_RESPONSE]: handleDatasheetCode,
  }

  const deviceTreeTopicsHandlers = {
    [DEVICETREE_RESPONSE]: handleDeviceTreeResponse,
  }

  processMessageFromQueue(config.ingestionResultQueue, ingestionTopicsHandlers)
  processMessageFromQueue(config.queryResultQueue, queryTopicsHandlers)
  processMessageFromQueue(config.datasheetResultQueue, datasheetTopicsHandlers)
  processMessageFromQueue(
    config.deviceTreeResultQueue,
    deviceTreeTopicsHandlers
  )
}

startConsuming()
