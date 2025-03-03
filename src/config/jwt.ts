import jwt, { SignOptions } from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET as jwt.Secret, {
    expiresIn: JWT_EXPIRES_IN
  } as SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET as jwt.Secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  } as SignOptions);
};

// Verify JWT token
export const verifyToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
};

// Calculate expiry date for refresh token
export const getRefreshTokenExpiryDate = (): Date => {
  // Parse the refresh token expiry time
  const expiryString = REFRESH_TOKEN_EXPIRES_IN;
  let days = 7; // Default to 7 days
  
  if (expiryString.endsWith('d')) {
    days = parseInt(expiryString.slice(0, -1)) || days;
  }
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
}; 