import axios from 'axios'

export const handleDatasheetCode = async (message: any) => {
  axios({
    url: `http://localhost:3000/api/webhooks/datasheet-code`,
    method: 'put',
    data: {
      apiKey: 'RE8k4z6rpCVk9y2EmEWAFR0gf',
      datasheetId: message.datasheet_id,
      user: message.user,
      files: message.files,
    },
  })
}
