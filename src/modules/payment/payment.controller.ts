import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { CurrentUser, Protected } from "@/shared/decorators";

import {
	InitPaymentRequest,
	InitPaymentResponse,
	RefundPaymentResponse,
} from "./dto";
import { PaymentClientGrpc } from "./payment.grpc";

@Controller("payment")
export class PaymentController {
	public constructor(private readonly client: PaymentClientGrpc) {}

	@ApiOperation({
		summary: "Init payment",
		description: "Initiates a payment for a booking.",
	})
	@ApiOkResponse({ type: InitPaymentResponse })
	@ApiBearerAuth()
	@Throttle({ default: { limit: 10, ttl: 60000 } })
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

	@ApiOperation({
		summary: "Refund payment",
		description: "Refunds a previously made payment by its id.",
	})
	@ApiOkResponse({ type: RefundPaymentResponse })
	@ApiBearerAuth()
	@Throttle({ default: { limit: 10, ttl: 60000 } })
	@Protected()
	@Post("refund/:id")
	@HttpCode(HttpStatus.OK)
	public async refundPayment(@Param("id") paymentId: string) {
		return this.client.call("refundPayment", {
			paymentId,
		});
	}
}
