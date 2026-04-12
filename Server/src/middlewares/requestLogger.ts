import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

const SENSITIVE_FIELDS = ["password", "aadhaarNumber", "token", "otp"];

const sanitize = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;

  const clone: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (SENSITIVE_FIELDS.includes(key)) {
      clone[key] = "***";
    } else if (typeof obj[key] === "object") {
      clone[key] = sanitize(obj[key]);
    } else {
      clone[key] = obj[key];
    }
  }

  return clone;
};

const hasKeys = (obj: any) =>
  obj && typeof obj === "object" && Object.keys(obj).length > 0;

const getIndianTime = () =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const requestId = randomUUID();

  (req as any).requestId = requestId;

  const { method, originalUrl } = req;

  console.log(`\n🟡 [REQUEST START]`);
  console.log(`ID: ${requestId}`);
  console.log(`Time (IST): ${getIndianTime()}`);
  console.log(`${method} ${originalUrl}`);

  // ✅ SAFE CHECKS
  if (hasKeys(req.query)) {
    console.log("Query:", JSON.stringify(req.query));
  }

  if (hasKeys(req.params)) {
    console.log("Params:", JSON.stringify(req.params));
  }

  if (hasKeys(req.body)) {
    console.log("Body:", JSON.stringify(sanitize(req.body)));
  }

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(`🟢 [REQUEST END]`);
    console.log(`ID: ${requestId}`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`-----------------------------\n`);
  });

  next();
};
