import { redis } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/errorHandler.js";

type RateLimiterParams = {
  limit?: number;
  timer?: number;
  page: string;
};

const rateLimiter = ({ limit = 20, timer = 60, page }: RateLimiterParams) =>
  TryCatch(async (req, res, next) => {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const key = `${clientIp}:${page}:request_count`;

    const requestCount = await redis.incr(key);

    if (requestCount === 1) await redis.expire(key, timer);

    const timeRemaining = await redis.ttl(key);

    if (requestCount > limit)
      return next(
        new ErrorHandler(
          429,
          `You have exceeded the ${limit} requests in ${timer} seconds limit. Please try again in ${timeRemaining} seconds`
        )
      );

    next();
  });

export { rateLimiter };
