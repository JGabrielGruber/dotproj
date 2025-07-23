export const env = {
  API_URL: process.env.API_URL || "localhost:8000",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),
  REDIS_DB: parseInt(process.env.REDIS_DB || "0", 10),
  PORT: parseInt(process.env.PORT || "8080", 10),
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || null,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || null,
};
