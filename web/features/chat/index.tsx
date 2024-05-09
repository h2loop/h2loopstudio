import { getAssetsApi } from '@/apis/assets'
import { Divider } from '@mantine/core'
import { useEffect, useState } from 'react'
import useStore from '../../store'
import ChatWindow from './chat-window'
import styles from './chat.module.scss'
import ChatHistory from './history'

const ProjectDetailsScreen = () => {
  const [repoLink, setRepoLink] = useState(
    'https://github1s.com/shivamsanju/ragswift'
  )
  const activeChat = useStore((state) => state.activeChat)

  useEffect(() => {
    if (activeChat?.projectId) {
      getAssetsApi(activeChat?.projectId, 0, 1).then((data) => {
        if (data['assets'] && data['assets'].length > 0) {
          const rk = JSON.parse(data['assets'][0].readerKwargs)
          console.log(rk)
          setRepoLink(`https://github1s.com/${rk.owner}/${rk.repo}`)
        }
      })
    }
  }, [activeChat?.projectId])

  return (
    <div className={styles.content}>
      <div className={styles.menuContent}>
        <ChatHistory />
      </div>
      <div className={styles.codeContent}>
        <iframe src={repoLink} height={'100%'}></iframe>
      </div>
      <Divider size="xs" orientation="vertical" />
      <div className={styles.tabContent}>
        <ChatWindow />
      </div>
    </div>
  )
}

export default ProjectDetailsScreen
