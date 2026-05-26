import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey && resendApiKey !== 'your_resend_api_key' && resendApiKey.trim() !== ''
  ? new Resend(resendApiKey)
  : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log('\n--- MOCK EMAIL SENT ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('HTML Body (first 200 chars):', html.substring(0, 200) + '...');
    console.log('-----------------------\n');
    return { data: { id: 'mock-email-id' }, success: true };
  }

  try {
    const fromName = process.env.HOSPITAL_NAME || 'City Care Hospital';
    const fromEmail = process.env.HOSPITAL_EMAIL || 'onboarding@resend.dev'; // Resend sandbox default if not verified
    
    // In dev mode with Resend sandbox, we can only send to the registered email or using sandbox defaults
    const response = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
    });

    return { data: response, success: true };
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    return { error, success: false };
  }
}
