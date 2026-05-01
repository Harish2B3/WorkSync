import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Using explicit host/port with strict timeouts to prevent the server from hanging
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"WorkSync" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'WorkSync OTP',
    text: `Your verification code is: ${otp}`,
  };

  try {
    // Send mail with a timeout
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
    return info;
  } catch (error) {
    console.error('❌ Nodemailer Error:', error.message);
    // We throw the error so the controller can catch it and inform the user
    throw error;
  }
};
