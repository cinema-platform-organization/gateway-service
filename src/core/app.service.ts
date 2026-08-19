import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	public getHello() {
		return { message: "Welcome to Cinema Platform API!" };
	}

	public getHealth() {
		return { status: "ok", timestamp: new Date().toISOString() };
	}
}
