import { CodeHighlightTabs } from "@mantine/code-highlight";
import styles from "./logviewer.module.scss";

const LogViewer = ({ text, filename }: { text: string, filename: string }) => {

  return (
    <div className={styles.container}>
      <CodeHighlightTabs
        style={{ height: "70vh", overflow: 'auto' }}
        code={[
          {
            fileName: filename,
            code: text,
            language: 'text',
          },
        ]}
      />
    </div>
  )
}

export default LogViewer
