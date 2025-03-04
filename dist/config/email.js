"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = SMTP_USER;
// Create transporter
const transporter = nodemailer_1.default.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});
// Send email
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Auth System" <${FROM_EMAIL}>`,
            to,
            subject,
            html
        });
        console.log(`Email sent to ${to}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};
exports.sendEmail = sendEmail;
// Send verification email
const sendVerificationEmail = async (to, token) => {
    const verificationUrl = `${process.env.VITE_APP_URL}/verify-email?token=${token}`;
    const html = `
    <h1>Email Verification</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
    await (0, exports.sendEmail)(to, 'Verify Your Email', html);
};
exports.sendVerificationEmail = sendVerificationEmail;
// Send password reset email
const sendPasswordResetEmail = async (to, token) => {
    const resetUrl = `${process.env.VITE_APP_URL}/reset-password?token=${token}`;
    const html = `
    <h1>Password Reset</h1>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
  `;
    await (0, exports.sendEmail)(to, 'Reset Your Password', html);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=email.js.map