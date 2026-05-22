import type { JwtPayload } from '../auth/jwt-payload';

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

export {};
