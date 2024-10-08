import { Card, rem, Stack, Text } from '@mantine/core'
import { Dropzone, FileWithPath } from '@mantine/dropzone'
import { IconFileTypeTxt, IconUpload, IconX } from '@tabler/icons-react'

const LogUploader = ({
  loading,
  handleDrop,
  files,
}: {
  loading: boolean
  handleDrop: (files: FileWithPath[]) => any
  files: FileWithPath[]
}) => {
  return (
    <Card style={{ cursor: 'pointer', height: '100%' }}>
      <Dropzone
        loading={loading}
        maxFiles={1}
        onDrop={(files) => handleDrop(files)}
        maxSize={5 * 1024 ** 2}
        accept={["text/plain",]}
      >
        <Stack
          align="center"
          justify="center"
          gap="lg"
          mih={180}
          style={{ pointerEvents: 'none' }}
        >
          <Dropzone.Accept>
            <IconUpload
              style={{
                width: rem(52),
                height: rem(52),
                color: 'var(--mantine-color-blue-6)',
              }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{
                width: rem(52),
                height: rem(52),
                color: 'var(--mantine-color-red-6)',
              }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFileTypeTxt
              style={{
                width: rem(52),
                height: rem(52),
                color: 'var(--mantine-color-dimmed)',
              }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          {files?.length == 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Text size="xl" inline>
                Upload log files
              </Text>
              <Text size="xs" c="dimmed" inline mt={14}>
                .txt files are supported now
              </Text>
            </div>
          ) : (
            <div>
              <Text size={'xl'} inline>
                {files?.length > 0 ? files[0].name : 'No files selected'}
              </Text>
            </div>
          )}
        </Stack>
      </Dropzone>
    </Card>
  )
}

export default LogUploader
