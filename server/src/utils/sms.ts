import AfricasTalking from 'africastalking'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Africa's Talking SMS client
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AT = AfricasTalking({
  apiKey: env.AT_API_KEY,
  username: env.AT_USERNAME,
})

const smsClient = AT.SMS

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEND OTP SMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function sendOTPSms(phone: string, otp: string): Promise<boolean> {
  const message = `Your Chakula verification code is: ${otp}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`

  try {
    // In sandbox mode, Africa's Talking accepts any phone
    // In production, phone must be registered
    const result = await smsClient.send({
      to: [phone],
      message,
      from: env.AT_USERNAME === 'sandbox' ? undefined : env.AT_SENDER_ID,
    })

    const recipient = result.SMSMessageData?.Recipients?.[0]

    if (recipient?.status === 'Success' || env.AT_USERNAME === 'sandbox') {
      logger.info(
        { phone: phone.slice(0, 5) + '***' + phone.slice(-3) },
        'OTP SMS sent successfully'
      )
      return true
    }

    logger.warn(
      { status: recipient?.status, phone: phone.slice(0, 5) + '***' },
      'OTP SMS delivery uncertain'
    )
    return true // Still return true — OTP is stored, user can retry
  } catch (error) {
    // SMS failure is non-critical — log but don't throw
    // OTP is already stored in Redis, user sees error and can retry
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown', phone: phone.slice(0, 5) + '***' },
      'OTP SMS send failed'
    )
    return false
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEND ORDER UPDATE SMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function sendOrderSms(phone: string, message: string): Promise<void> {
  try {
    await smsClient.send({
      to: [phone],
      message,
      from: env.AT_USERNAME === 'sandbox' ? undefined : env.AT_SENDER_ID,
    })
    logger.info('Order SMS sent')
  } catch (error) {
    // Non-critical — log only
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown' },
      'Order SMS failed'
    )
  }
}