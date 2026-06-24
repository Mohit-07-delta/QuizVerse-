import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma known errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as Error & { code: string; meta?: Record<string, unknown> };
    switch (prismaError.code) {
      case "P2002": {
        const target = prismaError.meta?.target;
        const targetStr = Array.isArray(target) ? target.join(", ") : target || "unique field";
        res.status(409).json({
          success: false,
          message: `Duplicate value for: ${targetStr}.`,
        });
        return;
      }
      case "P2025":
        res.status(404).json({
          success: false,
          message: "Record not found.",
        });
        return;
      default:
        res.status(400).json({
          success: false,
          message: "Database error.",
        });
        return;
    }
  }

  // Prisma validation error
  if (err.name === "PrismaClientValidationError") {
    res.status(400).json({
      success: false,
      message: "Invalid data provided.",
    });
    return;
  }

  // JSON parse error
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON in request body.",
    });
    return;
  }

  // Default 500
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error."
        : err.message || "Internal server error.",
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Resource not found.",
  });
};

export default errorHandler;
