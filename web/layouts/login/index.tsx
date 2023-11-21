import { COLOR_BG_TEXT } from '@/constants'
import { GoogleOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row } from 'antd'
import { signIn } from 'next-auth/react'
import styles from './login.module.scss'

export default function LoginScreen() {
  return (
    <div>
      <Row className={styles.loginContainer}>
        <Col span={8} className={styles.content}>
          <Card className={styles.loginCard}>
            <div className={styles.loginText}>Login to Herald</div>
            <Button block onClick={() => signIn('google')} color="secondary">
              <GoogleOutlined />
              Sign in with Google
            </Button>
            <div
              style={{
                color: COLOR_BG_TEXT,
                textAlign: 'center',
                marginTop: '3em',
              }}
            >
              &copy; www.heraldkms.com
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
