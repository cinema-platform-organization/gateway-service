import {
	ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";

import { grpcToHttpStatus } from "../utils";

interface GrpcError {
	code: number;
	details: string;
}

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
	public catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		if (this.isGrpcError(exception)) {
			const status = grpcToHttpStatus[exception.code] || 500;

			return response.status(status).json({
				statusCode: status,
				message: exception.details || "gRPC error",
			});
		}

		if (exception instanceof HttpException) {
			const status = exception.getStatus();

			return response.status(status).json({
				statusCode: status,
				message: exception.message,
			});
		}

		return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
			statusCode: 500,
			message: "Internal server error",
		});
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
