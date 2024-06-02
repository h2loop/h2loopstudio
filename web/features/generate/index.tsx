import { uploadDatasheetApi } from '@/apis/generate'
import useStore from '@/store'
import { Carousel } from '@mantine/carousel'
import { Button, Grid, Text, Textarea, Title } from '@mantine/core'
import { FileWithPath } from '@mantine/dropzone'
import { showNotification } from '@mantine/notifications'
import { useCallback, useState } from 'react'
import CodeBlock from './codeblock'
import styles from './generate.module.scss'
import PdfViewer from './pdfviewer'
import DatasheetUploader from './uploader'
import '@mantine/carousel/styles.css'

const CodeGenerationScreen = () => {
  const setDatasheetId = useStore((state) => state.setDatasheetId)
  const setDatasheetFiles = useStore((state) => state.setDatasheetFiles)
  const [loading, setLoading] = useState<boolean>(false)
  const [codeLoading, setCodeLoading] = useState<boolean>(false)
  const [files, setFiles] = useState<FileWithPath[]>([])
  const [instruction, setInstuction] = useState<string>('')

  const handleDrop = useCallback(
    (files: FileWithPath[]) => {
      setFiles(files)
      console.log(files[0])
    },
    [setFiles]
  )

  const handleReset = () => {
    setFiles([])
    setDatasheetFiles([])
    setCodeLoading(false)
    setLoading(false)
  }

  const handleStart = useCallback(async () => {
    if (files) {
      // set loading status
      setLoading(true)
      setCodeLoading(true)
      setDatasheetFiles([])
      try {
        const data = await uploadDatasheetApi(files, instruction)
        setDatasheetId(data.requestId)
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
  }, [files, instruction])

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Title order={3}>Generate driver files from datasheet</Title>
      </div>
      <Grid>
        <Grid.Col span={6}>
          {files.length > 0 ? (
            <Carousel withIndicators>
              {files.map((file) => (
                <Carousel.Slide>
                  <Text size="sm">{file.name}</Text>
                  <PdfViewer pdfData={file} />
                </Carousel.Slide>
              ))}
            </Carousel>
          ) : (
            <div className={styles.uploadAndPrompt}>
              <DatasheetUploader
                loading={loading}
                handleDrop={handleDrop}
                files={files}
              />
              <Textarea
                label="Additional Instruction"
                placeholder="The driver should include initialization routines, read and write functions for accessing the sensor's registers, and configuration settings for temperature resolution."
                autosize
                minRows={14}
                maxRows={14}
                value={instruction}
                onChange={(e) => setInstuction(e.target.value)}
              />
            </div>
          )}
          <div className={styles.btnGrp}>
            <Button
              disabled={!files || files.length == 0}
              onClick={handleStart}
              className={styles.generateButton}
            >
              Generate
            </Button>
            <Button
              disabled={!files || files.length == 0}
              onClick={handleReset}
              className={styles.generateButton}
            >
              Reset
            </Button>
          </div>
        </Grid.Col>
        <Grid.Col span={6}>
          <CodeBlock loading={codeLoading} />
        </Grid.Col>
      </Grid>
    </div>
  )
}

export default CodeGenerationScreen
