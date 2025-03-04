"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefreshTokenExpiryDate = exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
// Generate JWT token
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};
exports.generateToken = generateToken;
// Generate refresh token
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
};
exports.generateRefreshToken = generateRefreshToken;
// Verify JWT token
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
// Calculate expiry date for refresh token
const getRefreshTokenExpiryDate = () => {
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
exports.getRefreshTokenExpiryDate = getRefreshTokenExpiryDate;
//# sourceMappingURL=jwt.js.map