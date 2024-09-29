import { sendDebugJob } from '@/lib/controllers/generate'
import ApiRouteHandler from '@/lib/utils/apihandler'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default ApiRouteHandler({
  POST: sendDebugJob,
})
