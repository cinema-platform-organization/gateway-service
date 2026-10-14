import {
	ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { grpcToHttpStatus } from "../utils";

interface GrpcError {
	code: number;
	details: string;
}

interface ResolvedError {
	status: number;
	message: string | string[];
}

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GrpcExceptionFilter.name);

	public catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const { status, message } = this.resolve(exception);

		const logContext = {
			method: request.method,
			path: request.originalUrl ?? request.url,
			status,
		};

		if (status >= 500) {
			this.logger.error(
				{ err: exception as Error, ...logContext },
				"Request failed",
			);
		} else {
			this.logger.debug({ ...logContext, message }, "Request rejected");
		}

		return response.status(status).json({
			statusCode: status,
			message,
		});
	}

	private resolve(exception: unknown): ResolvedError {
		if (this.isGrpcError(exception)) {
			return {
				status:
					grpcToHttpStatus[exception.code] ??
					HttpStatus.INTERNAL_SERVER_ERROR,
				message: exception.details || "gRPC error",
			};
		}

		if (exception instanceof HttpException) {
			const body = exception.getResponse();

			const message =
				typeof body === "string"
					? body
					: ((body as { message?: string | string[] }).message ??
						exception.message);

			return { status: exception.getStatus(), message };
		}

		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			message: "Internal server error",
		};
	}

	private isGrpcError(exception: unknown): exception is GrpcError {
		return (
			typeof exception === "object" &&
			exception !== null &&
			"code" in exception &&
			"details" in exception
		);
	}
}
