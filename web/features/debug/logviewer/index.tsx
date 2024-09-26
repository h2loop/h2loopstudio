import { CodeHighlightTabs } from "@mantine/code-highlight";
import { useEffect, useState } from "react";
import styles from "./logviewer.module.scss";

const LogViewer = ({ file, filename }: { file: any, filename: string }) => {
  const [text, setText] = useState<string>('');


  useEffect(() => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      setText(e.target?.result as string)
    };
    reader.readAsText(file)
  }, [])

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
