import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

import { AppService } from "./app.service";

@Controller()
export class AppController {
	public constructor(private readonly appService: AppService) {}

	@ApiOperation({
		summary: "Welcome endpoint",
		description: "Returns a simple API welcome message.",
	})
	@Get()
	public getHello() {
		return this.appService.getHello();
	}

	@ApiOperation({
		summary: "Health check",
		description: "Checks if the gateway is running.",
	})
	@ApiOkResponse({
		type: Object,
		description: "Returns a health check object.",
	})
	@SkipThrottle()
	@Get("health")
	public health() {
		return this.appService.getHealth();
	}
}
