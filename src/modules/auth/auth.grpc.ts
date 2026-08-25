import type {
	AuthServiceClient,
	RefreshRequest,
	SendOtpRequest,
	VerifyOtpRequest,
} from "@cinema-platform/contracts/gen/auth";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

@Injectable()
export class AuthClientGrpc implements OnModuleInit {
	private authService: AuthServiceClient;

	public constructor(
		@Inject("AUTH_PACKAGE") private readonly client: ClientGrpc,
	) {}

	public onModuleInit() {
		this.authService =
			this.client.getService<AuthServiceClient>("AuthService");
	}

	public sendOtp(request: SendOtpRequest) {
		return this.authService.sendOtp(request);
	}

	public verifyOtp(request: VerifyOtpRequest) {
		return this.authService.verifyOtp(request);
	}

	public refresh(request: RefreshRequest) {
		return this.authService.refresh(request);
	}
}
