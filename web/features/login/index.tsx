import { Button, Card } from '@mantine/core'
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import styles from './login.module.scss'

export default function LoginScreen() {
  return (
    <div className={styles.loginScreen}>
      <Card className={styles.loginCard}>
        <Image alt="logo" src="/images/logo.png" width={150} height={150} />
        <div className={styles.loginText}>Login to H2LooP.ai</div>
        <Button
          onClick={() => signIn('google')}
          leftSection={<IconBrandGoogle />}
        >
          Sign in with Google
        </Button>
        <Button
          onClick={() => signIn('github')}
          leftSection={<IconBrandGithub />}
        >
          Sign in with GitHub
        </Button>
      </Card>
    </div>
  )
}
