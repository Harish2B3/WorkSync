import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// The simplest way: Nodemailer handles all SMTP details automatically for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'WorkSync OTP',
    text: `Your verification code is: ${otp}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
    return info;
  } catch (error) {
    console.error('❌ Nodemailer Error:', error.message);
    throw new Error('Failed to send email');
  }
};
