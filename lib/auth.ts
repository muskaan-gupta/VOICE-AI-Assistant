import { sign, verify } from 'jsonwebtoken'
import { SafeUser } from './database'

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  name: string
  iat?: number
  exp?: number
}

// Generate JWT token
export function generateToken(user: SafeUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name
  }
  
  return sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  } as any)
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Extract token from authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

// Generate refresh token (longer expiry)
export function generateRefreshToken(user: SafeUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name
  }
  
  return sign(payload, JWT_SECRET, {
    expiresIn: '30d'
  } as any)
}
