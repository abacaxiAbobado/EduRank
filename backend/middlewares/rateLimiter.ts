import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const ipCache = new Map<string, RateLimitInfo>();

/**
 * Creates an Express middleware for rate limiting.
 * @param windowMs Time window in milliseconds (e.g. 1 minute = 60 * 1000)
 * @param maxRequests Maximum requests per window
 * @param message Custom error message on rate limit exceed
 */
export function createRateLimiter(windowMs: number, maxRequests: number, message: string) {
  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();
    
    let info = ipCache.get(ip);
    
    if (!info) {
      info = {
        count: 1,
        resetTime: now + windowMs
      };
      ipCache.set(ip, info);
      next();
      return;
    }
    
    if (now > info.resetTime) {
      info.count = 1;
      info.resetTime = now + windowMs;
      next();
      return;
    }
    
    info.count += 1;
    if (info.count > maxRequests) {
      const remainingSeconds = Math.ceil((info.resetTime - now) / 1000);
      res.status(429).json({
        error: message,
        retryAfter: remainingSeconds
      });
      return;
    }
    
    next();
  };
}

// Export default limiters
export const authRateLimiter = createRateLimiter(
  3 * 60 * 1000, // 3 minutes
  15,            // 15 attempts
  'Muitas tentativas de autenticação criadas a partir deste IP. Tente novamente em 3 minutos.'
);

export const quizSubmissionLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  10,            // 10 submissions max per minute
  'Muitas submissões de quiz detectadas. Reduza o ritmo para manter o tráfego saudável.'
);
