import NoDataComponent from '@/components/Empty'
import { Card, Center, Loader, Text } from '@mantine/core'
import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import CodeBlock from './Codeblock'
import styles from './message.module.scss'

type MessageProps = {
  response: string
  loading: boolean
}

const MessageBody: FC<MessageProps> = ({ response, loading }) => {
  return (
    <div className={styles.chatMessageContent}>
      {loading && !response ? (
        <Card className={styles.responseMessageText}>
          <Center>
            <Loader size="xs" mr="md" />
            <Text size="md">Generating Device Tree</Text>
          </Center>
        </Card>
      ) : response ? (
        <Card className={styles.responseMessageText}>
          <ReactMarkdown
            children={response}
            components={{
              code: CodeBlock,
            }}
          />
        </Card>
      ) : (
        <NoDataComponent
          message="Please generate schematics"
          submessage="Please upload hardware schematics and click generate to view device tree"
        />
      )}
    </div>
  )
}

export default MessageBody
