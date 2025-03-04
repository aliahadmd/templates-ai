import jwt from 'jsonwebtoken';
export declare const generateToken: (id: string) => string;
export declare const generateRefreshToken: (id: string) => string;
export declare const verifyToken: (token: string) => jwt.JwtPayload;
export declare const getRefreshTokenExpiryDate: () => Date;
