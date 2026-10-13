import { ApiProperty } from "@nestjs/swagger";

/**
 * Body of every error response. Produced by GrpcExceptionFilter for
 * gRPC errors, HttpExceptions (guards, validation, throttling) and
 * unexpected exceptions alike.
 */
export class ErrorResponse {
	@ApiProperty({
		description: "HTTP status code, repeated in the body for convenience",
		example: 404,
		minimum: 400,
		maximum: 599,
	})
	public statusCode: number;

	@ApiProperty({
		description:
			"Human-readable error message. A single string for most errors; " +
			"an array with one message per invalid field for validation errors (400).",
		oneOf: [
			{ type: "string", example: "Movie not found" },
			{
				type: "array",
				items: { type: "string" },
				example: [
					"title must be a string",
					"duration must be a positive number",
				],
			},
		],
	})
	public message: string | string[];
}
