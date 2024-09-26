import { Text, Timeline } from '@mantine/core'
import {
  IconCheck,
  IconDatabase,
  IconFileCode,
  IconLoader,
  IconSettings,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'

const CodeLoader = () => {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 2) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getBullet = (step: number) => {
    if (activeStep === step) {
      return <IconLoader size={12} />
    } else if (activeStep > step) {
      return <IconCheck size={12} />
    } else {
      return step === 0 ? (
        <IconDatabase size={12} />
      ) : step === 1 ? (
        <IconSettings size={12} />
      ) : (
        <IconFileCode size={12} />
      )
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        marginTop: '10vh',
      }}
    >
      <Timeline active={activeStep} bulletSize={24} lineWidth={2}>
        <Timeline.Item
          bullet={getBullet(0)}
          title="Reading log files"
        >
          <Text c="dimmed" size="sm">
            reading log files
          </Text>
        </Timeline.Item>

        <Timeline.Item
          bullet={getBullet(1)}
          title="Reading code"
        >
          <Text c="dimmed" size="sm">
            Understanding code and identifying relevant information from it
          </Text>
        </Timeline.Item>

        <Timeline.Item
          title="Identifying root cause"
          bullet={getBullet(2)}
          lineVariant="dashed"
        >
          <Text c="dimmed" size="sm">
            Identifying root cause from the code and log files
          </Text>
        </Timeline.Item>
      </Timeline>
    </div>
  )
}

export default CodeLoader
