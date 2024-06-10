import { Card, Center, Text } from '@mantine/core'
import { IconMoodEmpty } from '@tabler/icons-react'
import { FC } from 'react'

type Props = { message: string; submessage: string; height?: string }
const NoDataComponent: FC<Props> = ({ message, submessage, height }) => {
  return (
    <Center>
      <Card>
        <div
          style={{
            textAlign: 'center',
            padding: '2.2em 4em',
            height: height || 'auto',
          }}
        >
          <IconMoodEmpty size={48} color="#868e96" />
          <Text size="xl" mt="md">
            {message}
          </Text>
          <Text c="dimmed" size="xs" mt="xs">
            {submessage}
          </Text>
        </div>
      </Card>
    </Center>
  )
}

export default NoDataComponent
