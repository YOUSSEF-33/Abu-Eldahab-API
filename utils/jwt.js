import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate an access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, // Payload
    process.env.JWT_ACCESS_SECRET, // Access token secret
    { expiresIn: '15m' } // Access token expiration
  );
};

// Generate a refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, // Payload
    process.env.JWT_REFRESH_SECRET, // Refresh token secret
    { expiresIn: '7d' } // Refresh token expiration
  );
};

// Verify an access token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

// Verify a refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
};