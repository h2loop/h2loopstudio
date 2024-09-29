import { uploadDebugLogApi } from '@/apis/debug'
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


const DebugLogComponent = () => {
  const setDebugResponse = useStore((state) => state.setDebugResponse)
  const debugResponse = useStore((state) => state.debugResponse)
  const [loading, setLoading] = useState<boolean>(false)
  const [codeLoading, setCodeLoading] = useState<boolean>(false)
  const [files, setFiles] = useState<FileWithPath[]>([])
  const [text, setText] = useState<string>('');

  const handleDrop = useCallback(
    async (files: FileWithPath[]) => {
      setFiles(files)
      const reader = new FileReader()
      reader.onload = async (e) => {
        setText(e.target?.result as string)
      };
      reader.readAsText(files[0])
    },
    [setFiles]
  )

  const handleStart = useCallback(async () => {
    if (files) {
      // set loading status
      setLoading(true)
      setDebugResponse('')
      setCodeLoading(true)
      try {
        await uploadDebugLogApi(text)
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
  }, [files, text, uploadDebugLogApi, setLoading, setDebugResponse])

  const handleReset = () => {
    setFiles([])
    setDebugResponse('')
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
              <LogViewer text={text} filename={files[0].name} />
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
          <CodeBlock response={debugResponse} loading={codeLoading} />
        </Grid.Col>
      </Grid>
    </div>
  )
}

export default DebugLogComponent
