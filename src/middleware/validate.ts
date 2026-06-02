import { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";

export function validate(schema: z.ZodType, source: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: z.prettifyError(result.error),
      });
      return;
    }
    if (source === "body") {
      req.body = result.data;
    } else {
      (req as any).validatedQuery = result.data;
    }
    next();
  };
}
