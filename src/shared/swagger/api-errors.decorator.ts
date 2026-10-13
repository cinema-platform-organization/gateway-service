import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";

import { ErrorResponse } from "./error-response.dto";

export interface ApiErrorSpec {
	/** HTTP status the client receives */
	status: number;
	/** Exact message the client receives (array for validation errors) */
	message: string | string[];
	/** When this error happens */
	when: string;
}

export interface ApiErrorsOptions {
	/**
	 * "user"  — endpoint uses @Protected(): Bearer token required.
	 * "admin" — endpoint uses @Protected(Role.ADMIN): token + ADMIN role.
	 */
	auth?: "user" | "admin";
	/**
	 * Endpoint has a validated body, query or params DTO.
	 * Pass the real class-validator messages to show them as the example.
	 */
	validation?: boolean | string[];
	/**
	 * Requests per minute allowed for this endpoint.
	 * Defaults to the global limit (60); false for @SkipThrottle endpoints.
	 */
	throttle?: false | number;
	/**
	 * Endpoint calls another service over gRPC (default true).
	 * Adds 500 for unexpected failures and 503 when the service is down.
	 */
	downstream?: boolean;
	/** Errors specific to this endpoint */
	errors?: ApiErrorSpec[];
}

const STATUS_TITLES: Record<number, string> = {
	400: "Bad request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Not found",
	409: "Conflict",
	429: "Too many requests",
	500: "Internal server error",
	503: "Service unavailable",
};

const VALIDATION_ERROR: ApiErrorSpec = {
	status: 400,
	message: ["field must be a string", "field should not be empty"],
	when: "Request body, query or path parameters fail validation (one message per invalid field)",
};

/** Thrown by AuthGuard and PassportService.verify */
const UNAUTHORIZED_ERRORS: ApiErrorSpec[] = [
	{
		status: 401,
		message: "Authorization header missing",
		when: "No Authorization header was sent",
	},
	{
		status: 401,
		message: "Invalid authorization",
		when: "Authorization header does not start with `Bearer `",
	},
	{
		status: 401,
		message: "Token not provided",
		when: "Authorization header is `Bearer ` with an empty token",
	},
	{
		status: 401,
		message: "Invalid format",
		when: "Token does not consist of 4 dot-separated parts",
	},
	{
		status: 401,
		message: "Invalid signature",
		when: "Token was modified or signed with a different key",
	},
	{
		status: 401,
		message: "Expired",
		when: "Access token lifetime has passed; get a new one with the refresh token",
	},
	{
		status: 401,
		message: "Error",
		when: "Expiry inside the token is not a valid number",
	},
];

/** Thrown by RolesGuard for @Protected(Role.ADMIN) endpoints */
const ADMIN_ERRORS: ApiErrorSpec[] = [
	{
		status: 403,
		message: "You do not have permission to access this resource",
		when: "Authenticated user does not have the ADMIN role",
	},
	{
		status: 404,
		message: "Account not found",
		when: "Token is valid but the account behind it no longer exists",
	},
];

/** Failures of the service behind the gateway, possible on any gRPC call */
const DOWNSTREAM_ERRORS: ApiErrorSpec[] = [
	{
		status: 500,
		message: "Internal server error",
		when: "Unexpected failure in the gateway or the service behind it",
	},
	{
		status: 503,
		message:
			"No connection established. Last error: connect ECONNREFUSED 172.18.0.5:50051",
		when: "The service behind the gateway is down or unreachable (message comes from gRPC and varies)",
	},
];

const GLOBAL_THROTTLE_LIMIT = 60;

function throttleError(limit: number): ApiErrorSpec {
	return {
		status: 429,
		message: "ThrottlerException: Too Many Requests",
		when: `More than ${limit} requests per minute to this endpoint from the same IP`,
	};
}

/**
 * Documents every error an endpoint can return, grouped by status code.
 * Several errors with the same status are merged into one response with
 * a named example per message, so none of them overwrite each other.
 */
export function ApiErrors(options: ApiErrorsOptions = {}) {
	const specs: ApiErrorSpec[] = [];
	const decorators: Array<ClassDecorator | MethodDecorator> = [];

	if (Array.isArray(options.validation)) {
		specs.push({ ...VALIDATION_ERROR, message: options.validation });
	} else if (options.validation) {
		specs.push(VALIDATION_ERROR);
	}
	if (options.auth) {
		decorators.push(ApiBearerAuth());
		specs.push(...UNAUTHORIZED_ERRORS);
	}
	if (options.auth === "admin") {
		specs.push(...ADMIN_ERRORS);
	}

	specs.push(...(options.errors ?? []));

	if (options.throttle !== false) {
		specs.push(throttleError(options.throttle ?? GLOBAL_THROTTLE_LIMIT));
	}
	if (options.downstream !== false) {
		specs.push(...DOWNSTREAM_ERRORS);
	}

	const byStatus = new Map<number, ApiErrorSpec[]>();

	for (const spec of specs) {
		const list = byStatus.get(spec.status) ?? [];
		list.push(spec);
		byStatus.set(spec.status, list);
	}

	for (const [status, list] of byStatus) {
		const title = STATUS_TITLES[status] ?? "Error";

		const description = [
			title,
			"",
			...list.map(
				spec => `- **${formatMessage(spec.message)}** — ${spec.when}`,
			),
		].join("\n");

		const examples = Object.fromEntries(
			list.map((spec, index) => [
				`${status}_${index + 1}`,
				{
					summary: formatMessage(spec.message),
					value: { statusCode: status, message: spec.message },
				},
			]),
		);

		decorators.push(
			ApiResponse({
				status,
				description,
				type: ErrorResponse,
				examples,
			}),
		);
	}

	return applyDecorators(...decorators);
}

function formatMessage(message: string | string[]) {
	return Array.isArray(message) ? message.join("; ") : message;
}
