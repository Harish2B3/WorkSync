import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use service instead of host/port for better reliability with Gmail
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to take our messages');
  }
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"WorkSync" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your WorkSync OTP Code',
    text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">WorkSync Authentication</h2>
        <p>Use the following code to complete your sign-in or registration:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; padding: 10px; background: #f4f4f4; border-radius: 8px; text-align: center;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};
