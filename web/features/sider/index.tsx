import { getAssetsToReviewCountApi } from '@/apis/assets'
import useStore from '@/store'
import { Indicator, Text } from '@mantine/core'
import {
  IconBoxMultiple,
  IconBug,
  IconBulbFilled,
  IconChecklist,
  IconCodeCircle2,
  IconPlant2,
  IconSettings,
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import styles from './sider.module.scss'

const getParentPath = (path: string) =>
  path === '/' ? path : `/${path?.split('/')[1]}`

export default function Sider() {
  const pathname = usePathname()

  const assetsToReviewCount = useStore((state) => state.assetsToReviewCount)
  const setAssetsToReviewCount = useStore(
    (state) => state.setAssetsToReviewCount
  )

  const items = useMemo(
    () => [
      { title: 'Ask', path: '/', icon: <IconBulbFilled /> },
      { title: 'Generate', path: '/generate', icon: <IconCodeCircle2 /> },
      { title: 'DeviceTree', path: '/devicetree', icon: <IconPlant2 /> },
      { title: 'Debug', path: '/debug', icon: <IconBug /> },
      { title: 'Projects', path: '/projects', icon: <IconBoxMultiple /> },
      {
        title: 'Review',
        path: '/review',
        icon: (
          <Indicator
            inline
            color="red"
            label={assetsToReviewCount}
            size={20}
            disabled={assetsToReviewCount < 1}
          >
            <IconChecklist />
          </Indicator>
        ),
      },
      { title: 'Settings', path: '/settings', icon: <IconSettings /> },
    ],
    [assetsToReviewCount]
  )

  useEffect(() => {
    getAssetsToReviewCountApi()
      .then((c) => setAssetsToReviewCount(c))
      .catch(() => setAssetsToReviewCount(0))
  }, [])

  return (
    <div className={styles.siderContainer}>
      <div className={styles.menuContainer}>
        {items.map((e) => (
          <div
            className={`${styles.navItem} ${getParentPath(pathname) == e.path ? styles.activeNavItem : ''
              }`}
          >
            <Link href={e.path} className={styles.navItemLink}>
              {e.icon}
              <Text
                style={{ fontSize: '0.4em' }}
                className={styles.navItemTitle}
              >
                {e.title}
              </Text>
            </Link>
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <Text size="sm" opacity={0.4}>
          V 0.1
        </Text>
      </div>
    </div>
  )
}
