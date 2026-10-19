import type { RequestHandler } from "express";

function validateRequiredFields(body: unknown, fields: string[]): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object.";
  }

  const values = body as Record<string, unknown>;
  for (const field of fields) {
    if (!Object.hasOwn(values, field) || values[field] == null || values[field] === "") {
      return `${field} is required.`;
    }
    if (typeof values[field] !== "string") return `${field} must be a string.`;
    if (!values[field].trim()) return `${field} is required.`;
  }
  return null;
}

export const registerValidation: RequestHandler = (req, res, next) => {
  const error = validateRequiredFields(req.body, ["name", "email", "password"]);
  if (error) return res.status(400).json({ success: false, message: error });

  const { name, email, password } = req.body;
  if (name.trim().length > 100) {
    return res.status(400).json({ success: false, message: "Name must be at most 100 characters." });
  }
  if (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, message: "Provide a valid email." });
  }
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters and at most 72 bytes." });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  return next();
};

export const loginValidation: RequestHandler = (req, res, next) => {
  const error = validateRequiredFields(req.body, ["email", "password"]);
  if (error) return res.status(400).json({ success: false, message: error });

  const { email, password } = req.body;
  if (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, message: "Provide a valid email." });
  }
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters and at most 72 bytes." });
  }

  req.body.email = email.trim().toLowerCase();
  return next();
};

export const refreshTokenValidation: RequestHandler = (req, res, next) => {
  const error = validateRequiredFields(req.body, ["refreshToken"]);
  if (error) return res.status(400).json({ success: false, message: error });
  return next();
};
