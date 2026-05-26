import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'stadium-jwt-secret-change-in-prod',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'stadium-jwt-refresh-secret-change-in-prod',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
