import NoDataComponent from '@/components/Empty'
import { Card } from '@mantine/core'
import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import CodeBlock from './Codeblock'
import CodeLoader from './loader'
import styles from './message.module.scss'

type MessageProps = {
  response: string
  loading: boolean
}

const MessageBody: FC<MessageProps> = ({ response, loading }) => {
  return (
    <div className={styles.chatMessageContent}>
      {loading && !response ? (
        <CodeLoader />
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
          height="75vh"
          message="Please generate schematics"
          submessage="Please upload hardware schematics and click generate to view device tree"
        />
      )}
    </div>
  )
}

export default MessageBody
