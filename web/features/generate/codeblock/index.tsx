import { CodeHighlightTabs } from '@mantine/code-highlight'
import '@mantine/code-highlight/styles.css'
import useStore from '@/store'
import { Card, Title } from '@mantine/core'
import styles from './codeblock.module.scss'
import CodeLoader from './loader'

const CodeBlock = ({ loading }: { loading: boolean }) => {
  const datasheetFiles = useStore((state) => state.datasheetFiles)

  return (
    <Card className={styles.container}>
      {loading && datasheetFiles.length == 0 ? (
        <CodeLoader />
      ) : (
        <>
          <Title order={6} className={styles.title}>
            Generated driver code
          </Title>
          {datasheetFiles.length > 0 ? (
            <CodeHighlightTabs
              code={datasheetFiles}
              className={styles.codeBlock}
            />
          ) : (
            <CodeHighlightTabs
              code={[
                {
                  fileName: 'untitled.c',
                  code: '// Please upload datasheet to generate code\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n...',
                  language: 'c',
                },
              ]}
            />
          )}
        </>
      )}
    </Card>
  )
}

export default CodeBlock
