import { Global, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import {
	makeCounterProvider,
	makeGaugeProvider,
	makeHistogramProvider,
	PrometheusModule,
} from "@willsoto/nestjs-prometheus";

import { HttpMetricsInterceptor } from "./http-metrics-interceptor";

@Global()
@Module({
	imports: [
		PrometheusModule.register({
			path: "/metrics",
			defaultMetrics: {
				enabled: true,
			},
			defaultLabels: {
				service: "gateway-service",
			},
		}),
	],
	providers: [
		makeHistogramProvider({
			name: "http_request_duration_seconds",
			help: "HTTP request latency",
			labelNames: ["method", "route", "status"],
			buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 1.5, 2, 3, 5],
		}),
		makeGaugeProvider({
			name: "http_requests_in_flight",
			help: "Current number of in-flight HTTP requests",
		}),
		makeCounterProvider({
			name: "http_requests_total",
			help: "Total HTTP requests",
			labelNames: ["method", "route", "status"],
		}),
		{
			provide: APP_INTERCEPTOR,
			useClass: HttpMetricsInterceptor,
		},
	],
})
export class MetricsModule {}
