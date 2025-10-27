import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body?._id || req.ip;
    const { success } = await ratelimit.limit(userId);

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }

    next();
  } catch (error) {
    console.log("Rate Limit Error", error);
    next(error);
  }
};

export default rateLimiter;
