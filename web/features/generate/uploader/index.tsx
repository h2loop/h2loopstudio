import { Card, Group, rem, Text } from '@mantine/core'
import { Dropzone, FileWithPath, PDF_MIME_TYPE } from '@mantine/dropzone'
import { IconFileTypePdf, IconUpload, IconX } from '@tabler/icons-react'

const DatasheetUploader = ({
  loading,
  handleDrop,
  files,
}: {
  loading: boolean
  handleDrop: (files: FileWithPath[]) => any
  files: FileWithPath[]
}) => {
  return (
    <Card style={{ cursor: 'pointer' }}>
      <Dropzone
        loading={loading}
        maxFiles={10}
        onDrop={(files) => handleDrop(files)}
        maxSize={5 * 1024 ** 2}
        accept={PDF_MIME_TYPE}
      >
        <Group
          justify="center"
          gap="md"
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
            <IconFileTypePdf
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
              <Text size="md" inline>
                Upload Datasheet
              </Text>
              <Text size="xs" c="dimmed" inline mt={7}>
                .pdf files are supported now
              </Text>
            </div>
          ) : (
            <div>
              <Text size={'xs'} inline>
                {files?.length > 0
                  ? files.map((e) => e.name).join(' \n')
                  : 'No files selected'}
              </Text>
            </div>
          )}
        </Group>
      </Dropzone>
    </Card>
  )
}

export default DatasheetUploader
