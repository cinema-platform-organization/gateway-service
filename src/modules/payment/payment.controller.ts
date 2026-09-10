import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Post,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { CurrentUser, Protected } from "@/shared/decorators";

import { InitPaymentRequest } from "./dto";
import { PaymentClientGrpc } from "./payment.grpc";

@Controller("payment")
export class PaymentController {
	public constructor(private readonly client: PaymentClientGrpc) {}

	@ApiBearerAuth()
	@Protected()
	@Post("init")
	@HttpCode(HttpStatus.OK)
	public async initPayment(
		@Body() dto: InitPaymentRequest,
		@CurrentUser() userId: string,
	) {
		return this.client.call("createPayment", {
			...dto,
			userId,
		});
	}

	@ApiBearerAuth()
	@Protected()
	@Post("refund/:id")
	@HttpCode(HttpStatus.OK)
	public async refundPayment(@Param("id") paymentId: string) {
		return this.client.call("refundPayment", {
			paymentId,
		});
	}
}
