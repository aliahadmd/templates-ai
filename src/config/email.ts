import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = SMTP_USER;

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// Send email
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Auth System" <${FROM_EMAIL}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

// Send verification email
export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.VITE_APP_URL}/verify-email?token=${token}`;
  
  const html = `
    <h1>Email Verification</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  
  await sendEmail(to, 'Verify Your Email', html);
};

// Send password reset email
export const sendPasswordResetEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.VITE_APP_URL}/reset-password?token=${token}`;
  
  const html = `
    <h1>Password Reset</h1>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
  `;
  
  await sendEmail(to, 'Reset Your Password', html);
}; 