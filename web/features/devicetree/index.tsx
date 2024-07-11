import { uploadHardwareSchematicsApi } from '@/apis/devicetree'
import useStore from '@/store'
import { Carousel } from '@mantine/carousel'
import { Button, Grid, Text, Title } from '@mantine/core'
import { FileWithPath } from '@mantine/dropzone'
import { showNotification } from '@mantine/notifications'
import { useCallback, useState } from 'react'
import CodeBlock from './codeblock'
import styles from './generate.module.scss'
import PdfViewer from './pdfviewer'
import DatasheetUploader from './uploader'
import '@mantine/carousel/styles.css'

const DeviceTreeGeneration = () => {
  const setDevicetreeResponse = useStore((state) => state.setDevicetreeResponse)
  const devicetreeResponse = useStore((state) => state.devicetreeResponse)
  const [loading, setLoading] = useState<boolean>(false)
  const [codeLoading, setCodeLoading] = useState<boolean>(false)
  const [files, setFiles] = useState<FileWithPath[]>([])

  const handleDrop = useCallback(
    (files: FileWithPath[]) => {
      setFiles(files)
      console.log(files[0])
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

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Title order={3}>Generate devicetree from hardware schematics</Title>
      </div>
      <Grid>
        <Grid.Col span={6}>
          {files.length > 0 ? (
            <div className={styles.uploadAndPrompt}>
              <Carousel withIndicators>
                {files.map((file) => (
                  <Carousel.Slide>
                    <Text size="sm">{file.name}</Text>
                    <PdfViewer pdfData={file} />
                  </Carousel.Slide>
                ))}
              </Carousel>
              <Button
                disabled={!files || files.length == 0}
                onClick={handleStart}
              >
                Generate
              </Button>
            </div>
          ) : (
            <DatasheetUploader
              loading={loading}
              handleDrop={handleDrop}
              files={files}
            />
          )}
        </Grid.Col>
        <Grid.Col span={6}>
          <CodeBlock response={devicetreeResponse} loading={codeLoading} />
        </Grid.Col>
      </Grid>
    </div>
  )
}

export default DeviceTreeGeneration
