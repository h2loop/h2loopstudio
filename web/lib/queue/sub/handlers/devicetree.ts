import axios from 'axios'

export const handleDeviceTreeResponse = async (message: any) => {
  axios({
    url: `http://localhost:3000/api/webhooks/devicetree`,
    method: 'put',
    data: {
      apiKey: 'RE8k4z6rpCVk9y2EmEWAFR0gf',
      requestId: message.request_id,
      user: message.user,
      response: message.response,
    },
  })
}
