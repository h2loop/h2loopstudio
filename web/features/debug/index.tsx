import { uploadHardwareSchematicsApi } from '@/apis/devicetree'
import useStore from '@/store'
import '@mantine/carousel/styles.css'
import { Button, Grid, Title } from '@mantine/core'
import { FileWithPath } from '@mantine/dropzone'
import { showNotification } from '@mantine/notifications'
import { useCallback, useState } from 'react'
import CodeBlock from './codeblock'
import styles from './debug.module.scss'
import LogViewer from './logviewer'
import LogUploader from './uploader'


const DeviceTreeGeneration = () => {
  const setDevicetreeResponse = useStore((state) => state.setDevicetreeResponse)
  const devicetreeResponse = useStore((state) => state.devicetreeResponse)
  const [loading, setLoading] = useState<boolean>(false)
  const [codeLoading, setCodeLoading] = useState<boolean>(false)
  const [files, setFiles] = useState<FileWithPath[]>([])

  const handleDrop = useCallback(
    async (files: FileWithPath[]) => {
      setFiles(files)
    },
    [setFiles]
  )

  const handleStart = useCallback(async () => {
    if (files) {
      // set loading status
      setLoading(true)
      setDevicetreeResponse('')
      setCodeLoading(true)
      try {
        await uploadHardwareSchematicsApi(files)
      } catch {
        showNotification({
          message: 'Some error occurred during upload.',
          color: 'red',
        })
      } finally {
        setLoading(false)
      }
    } else {
      showNotification({ message: 'Upload atleast one file', color: 'red' })
    }
  }, [files])

  const handleReset = () => {
    setFiles([])
    setDevicetreeResponse('')
    setCodeLoading(false)
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Title order={3}>Identify root cause using log files</Title>
      </div>
      <Grid>
        <Grid.Col span={6}>
          <div className={styles.uploadAndPrompt}>
            {files.length > 0 ? (
              <LogViewer file={files[0]} filename={files[0].name} />
            ) : (
              <LogUploader
                loading={loading}
                handleDrop={handleDrop}
                files={files}
              />
            )}
            <div className={styles.btnGrp}>
              <Button
                disabled={!files || files.length == 0}
                onClick={handleStart}
              >
                Identify root cause
              </Button>
              <Button
                disabled={!files || files.length == 0}
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </Grid.Col>
        <Grid.Col span={6}>
          <CodeBlock response={devicetreeResponse} loading={codeLoading} />
        </Grid.Col>
      </Grid>
    </div>
  )
}

export default DeviceTreeGeneration
