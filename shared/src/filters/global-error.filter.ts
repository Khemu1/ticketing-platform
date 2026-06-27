import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { CustomError } from "./CustomError";
import { throwError } from "rxjs";

const SAFE_STATUS_CODES = new Set([400, 401, 403, 404, 409, 410, 422]);

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType();

    if (type === "rpc") {
      const error = this.normalize(exception);
      return throwError(() => ({
        statusCode: error.statusCode,
        message: error.message,
        type: error.type,
        safe: error.safe,
        details: error.details,
        errors: error.errors,
      }));
    }

    // HTTP context (api-gateway)
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (res.headersSent) return;

    const error = this.normalize(exception);
    const isProd = process.env.NODE_ENV === "production";

    console.log("isProd", isProd, process.env.NODE_ENV);

    return isProd ? this.sendProd(error, res) : this.sendDev(error, res);
  }

  private normalize(exception: unknown): CustomError {
    if (exception instanceof CustomError) return exception;

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw: any = exception.getResponse();

      const message =
        typeof raw === "string" ? raw : (raw.message ?? exception.message);
      const errors = typeof raw === "object" ? raw.errors : undefined;
      const details = typeof raw === "object" ? raw.details : undefined;
      const type =
        typeof raw === "object" ? raw.type : this.resolveType(statusCode);

      return new CustomError(
        Array.isArray(message) ? message.join(", ") : message,
        statusCode,
        type,
        SAFE_STATUS_CODES.has(statusCode),
        details,
        errors,
      );
    }

    // errors coming back from microservices via RabbitMQ
    if (
      typeof exception === "object" &&
      exception !== null &&
      "statusCode" in exception
    ) {
      const err = exception as any;
      return new CustomError(
        err.message || "An error occurred",
        err.statusCode || 500,
        err.type || "server error",
        SAFE_STATUS_CODES.has(err.statusCode),
        err.details,
        err.errors,
      );
    }

    if (exception instanceof Error) {
      console.error("Unexpected error", exception);
      return new CustomError(exception.message, 500, "server error", false);
    }

    console.error("Unknown error type", exception);
    return new CustomError(
      "An unknown error occurred",
      500,
      "server error",
      false,
    );
  }

  private sendDev(error: CustomError, res: Response) {
    const { statusCode, status, message, stack, type, details, errors } = error;

    console.error("🚨 Error:", {
      statusCode,
      message,
      type,
      details,
      errors,
      stack,
    });

    res.status(statusCode).json({
      status,
      statusCode,
      message,
      stack,
      type,
      details,
      errors: errors ?? {},
    });
  }

  private sendProd(error: CustomError, res: Response) {
    if (error.safe) {
      const { statusCode, status, message, type, details, errors } = error;
      res.status(statusCode).json({
        status,
        statusCode,
        message,
        type,
        details,
        errors: errors ?? {},
      });
    } else {
      console.error("Critical Error (Hidden in Response)", error);
      res.status(500).json({
        status: "error",
        message: "An unexpected error occurred",
      });
    }
  }

  private resolveType(statusCode: number): string {
    if (statusCode >= 500) return "server error";
    if (statusCode === 401) return "authentication error";
    if (statusCode === 403) return "authorization error";
    if (statusCode === 404) return "not found";
    if (statusCode === 409) return "conflict";
    return "client error";
  }
}
