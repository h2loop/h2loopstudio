const getEnv = (
  varName: string,
  required: boolean = true,
  defaultValue?: string
): string => {
  const value = process.env[varName]

  if (required && !value) {
    if (defaultValue != undefined) return defaultValue
    throw new Error(`Couldn't find environment variable: ${varName}`)
  }
  return value === undefined ? 'NOT SET' : value
}

type configType = {
  dbUrl: string
  redisHost: string
  redisPort: number
  ingestionTaskQueue: string
  queryTaskQueue: string
  datasheetTaskQueue: string
  ingestionResultQueue: string
  queryResultQueue: string
  datasheetResultQueue: string
  deviceTreeTaskQueue: string
  deviceTreeResultQueue: string
  debugTaskQueue: string
  debugResultQueue: string
  serviceApiKey: string
  s3Endpoint: string
  s3AccessKey: string
  s3SecretKey: string
  s3Port: string
}

export const config: configType = {
  dbUrl: getEnv('DATABASE_URL'),
  redisHost: getEnv('REDIS_HOST'),
  redisPort: Number(getEnv('REDIS_PORT')),
  ingestionTaskQueue: getEnv('INGESTION_TASK_QUEUE'),
  queryTaskQueue: getEnv('QUERY_TASK_QUEUE'),
  datasheetTaskQueue: getEnv('DATASHEET_TASK_QUEUE'),
  ingestionResultQueue: getEnv('INGESTION_RESULT_QUEUE'),
  queryResultQueue: getEnv('QUERY_RESULT_QUEUE'),
  datasheetResultQueue: getEnv('DATASHEET_RESULT_QUEUE'),
  deviceTreeTaskQueue: getEnv('DEVICETREE_TASK_QUEUE'),
  deviceTreeResultQueue: getEnv('DEVICETREE_RESULT_QUEUE'),
  debugTaskQueue: getEnv('DEBUG_TASK_QUEUE'),
  debugResultQueue: getEnv('DEBUG_RESULT_QUEUE'),
  serviceApiKey: getEnv('SERVICE_API_KEY'),
  s3Endpoint: getEnv('S3_ENDPOINT'),
  s3AccessKey: getEnv('S3_ACCESS_KEY'),
  s3SecretKey: getEnv('S3_SECRET_KEY'),
  s3Port: getEnv('S3_PORT', false, '9000'),
}
