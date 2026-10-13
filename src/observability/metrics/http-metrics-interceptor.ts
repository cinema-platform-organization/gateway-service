import {
	CallHandler,
	ExecutionContext,
	Injectable,
	type NestInterceptor,
} from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import type { Request, Response } from "express";
import { Counter, Gauge, Histogram } from "prom-client";
import type { Observable } from "rxjs";

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
	public constructor(
		@InjectMetric("http_requests_total")
		private readonly counter: Counter<string>,
		@InjectMetric("http_request_duration_seconds")
		private readonly histogram: Histogram<string>,
		@InjectMetric("http_requests_in_flight")
		private readonly inFlight: Gauge<string>,
	) {}

	public intercept(
		context: ExecutionContext,
		next: CallHandler<unknown>,
	): Observable<unknown> {
		if (context.getType() !== "http") {
			return next.handle();
		}

		const req = context.switchToHttp().getRequest<Request>();
		const res = context.switchToHttp().getResponse<Response>();

		const method = req.method;
		const route = (req.route as { path?: string })?.path ?? "unknown";

		if (route === "/metrics") {
			return next.handle();
		}

		this.inFlight.inc();

		const endTimer = this.histogram.startTimer({ method, route });

		res.once("close", () => {
			const status = res.statusCode.toString();

			endTimer({ status });
			this.counter.inc({ method, route, status });
			this.inFlight.dec();
		});

		return next.handle();
	}
}
