import type {
	AccountServiceClient,
	GetAccountRequest,
} from "@cinema-platform/contracts/gen/account";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

@Injectable()
export class AccountClientGrpc implements OnModuleInit {
	private accountService: AccountServiceClient;

	public constructor(
		@Inject("ACCOUNT_PACKAGE") private readonly client: ClientGrpc,
	) {}

	public onModuleInit() {
		this.accountService =
			this.client.getService<AccountServiceClient>("AccountService");
	}

	public getAccount(request: GetAccountRequest) {
		return this.accountService.getAccount(request);
	}
}
