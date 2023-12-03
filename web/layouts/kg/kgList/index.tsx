import UserAvatar from '@/components/Avatar'
import CustomTable from '@/components/Table'
import { globalDateFormatParser } from '@/lib/functions'
import { Kg } from '@/types/kgs'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRouter } from 'next/navigation'
import { FC, useMemo } from 'react'
import styles from './kggrid.module.scss'

type KgListProps = {
  projectId: string
  kgs: Kg[]
  loading: boolean
}

const KGList: FC<KgListProps> = ({ projectId, kgs, loading }) => {
  const { push } = useRouter()

  const handleKgClick = (id: string) => {
    push(`/projects/${projectId}/kgs/${id}`, {
      scroll: false,
    })
  }

  const columns: ColumnsType<Kg> = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        render: (_, record) => (
          <span className={styles.kgTitle}>
            <img src="/icons/kg.svg" width={20} height={20} />
            {record.name}
          </span>
        ),
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        align: 'center',
        key: 'tags',
        width: '20%',
        ellipsis: true,
        render: (_, { tags }) => (
          <div className={styles.tags}>
            {tags?.map((tag) => {
              return (
                <Tag color={'warning'} key={tag}>
                  {tag}
                </Tag>
              )
            })}
          </div>
        ),
      },
      {
        title: 'Created By',
        dataIndex: 'createdBy',
        align: 'center',
        key: 'createdBy',
        render: (_, record) => (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
              justifyContent: 'center',
            }}
          >
            <UserOutlined />
            {record.createdBy}
          </span>
        ),
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        align: 'center',
        render: (_, record) => (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
              justifyContent: 'center',
            }}
          >
            <CalendarOutlined />
            {globalDateFormatParser(new Date(record.createdAt))}
          </span>
        ),
      },
      {
        title: 'Members',
        dataIndex: 'createdAt',
        align: 'center',
        render: (_, record) => (
          <Avatar.Group className={styles.kgMembers} maxCount={4}>
            {record.members?.map((e) => (
              <Tooltip title={`${e.name} (${e.role})`}>
                <UserAvatar userId={e.id} />
              </Tooltip>
            ))}
          </Avatar.Group>
        ),
      },
    ],
    []
  )

  return (
    <div className={styles.kgCardsContainer}>
      <CustomTable
        loading={loading}
        className={styles.assetList}
        rowClassName={styles.tableRow}
        columns={columns}
        dataSource={kgs}
        pagination={false}
        onRow={(record) => ({ onClick: () => handleKgClick(record.id) })}
      />
    </div>
  )
}

export default KGList
