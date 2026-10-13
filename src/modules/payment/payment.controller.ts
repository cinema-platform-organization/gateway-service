import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Post,
} from "@nestjs/common";
import {
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { CurrentUser, Protected } from "@/shared/decorators";
import { ApiErrors, type ApiErrorSpec } from "@/shared/swagger";

import {
	InitPaymentRequest,
	InitPaymentResponse,
	RefundPaymentResponse,
} from "./dto";
import { PaymentClientGrpc } from "./payment.grpc";

const SCREENING_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "<message from the screening service>",
	when: "No screening with this id (the message comes from the screening service)",
};

const SCREENING_BROKEN: ApiErrorSpec = {
	status: 500,
	message: "Screening exists but failed to load related data",
	when: "The screening exists but its movie, hall or theater could not be loaded",
};

@ApiTags("Payment")
@Controller("payment")
export class PaymentController {
	public constructor(private readonly client: PaymentClientGrpc) {}

	@ApiOperation({
		summary: "Book seats and start payment",
		description:
			"Reserves the seats and returns a LiqPay checkout URL.\n\n" +
			"Steps:\n" +
			"1. Each seat is checked: it must exist, be in the screening's hall and " +
			"not be booked yet.\n" +
			"2. The amount is the sum of the seats' **current prices from the server**; " +
			"`seats[].price` from the request is ignored.\n" +
			"3. An order with tickets is created in one transaction. The seats count " +
			"as taken from this moment, even before payment.\n" +
			"4. A pending payment is created and the LiqPay checkout URL is returned.\n\n" +
			"The booking is confirmed (and gets its QR code) when LiqPay reports a " +
			"successful payment. If confirming fails, the payment is refunded " +
			"automatically. Outside production LiqPay runs in sandbox mode.",
	})
	@ApiOkResponse({
		type: InitPaymentResponse,
		description: "Seats reserved, redirect the user to `url`",
	})
	@ApiErrors({
		auth: "user",
		throttle: 10,
		validation: [
			"screeningId must be a string",
			"screeningId should not be empty",
			"seats must be an array",
			"seats should not be empty",
			"seats.0.seatId must be a string",
			"seats.0.price must be an integer number",
			"savePaymentMethod must be a boolean value",
			"paymentMethodId must be a string",
		],
		errors: [
			{
				status: 400,
				message:
					"Seat kM2vRwYpQ8sN-4LzXbT7d is selected more than once",
				when: "The same seat id appears twice in `seats`",
			},
			{
				status: 400,
				message:
					"Seat kM2vRwYpQ8sN-4LzXbT7d is not in this screening's hall",
				when: "A seat belongs to a different hall than the screening",
			},
			{
				status: 400,
				message: "Screening has no hall assigned",
				when: "The screening's hall is missing (broken data)",
			},
			SCREENING_NOT_FOUND,
			{
				status: 404,
				message: "Seat kM2vRwYpQ8sN-4LzXbT7d not found",
				when: "A seat id does not exist",
			},
			{
				status: 409,
				message: "Seat kM2vRwYpQ8sN-4LzXbT7d is already taken",
				when: "A seat already has a ticket for this screening (paid or awaiting payment)",
			},
			{
				status: 409,
				message: "One of the selected seats is already taken",
				when: "Another user booked one of the seats at the same moment",
			},
			SCREENING_BROKEN,
		],
	})
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
		summary: "Cancel booking and refund",
		description:
			"Cancels the current user's paid booking and refunds the full amount " +
			"through LiqPay.\n\n" +
			"Rules:\n" +
			"- only the user who paid can refund\n" +
			"- only paid bookings, at least **2 hours before** the screening starts\n\n" +
			"The booking is canceled first (its seats become free), then LiqPay is " +
			"asked to refund. If LiqPay fails, the booking stays canceled and the " +
			"request can simply be sent again: it retries only the refund.",
	})
	@ApiParam({
		name: "id",
		description: "Booking (order) id, as in GET /bookings",
		example: "X6KBMTnCDkbrPN_I0YXG8",
	})
	@ApiOkResponse({
		type: RefundPaymentResponse,
		description: "Booking canceled and refunded",
	})
	@ApiErrors({
		auth: "user",
		throttle: 10,
		errors: [
			{
				status: 400,
				message: "Only successful payments can be refunded",
				when: "The payment is not completed, failed, or was already refunded",
			},
			{
				status: 400,
				message:
					"Cancellations are not allowed this close to the screening",
				when: "Less than 2 hours left before the screening starts",
			},
			{
				status: 400,
				message: "Reservation not paid or already canceled",
				when: "The booking is not in the paid state",
			},
			{
				status: 400,
				message: "Order has no tickets",
				when: "The booking has no tickets (broken data)",
			},
			{
				status: 400,
				message: "Payment is missing booking or user reference",
				when: "The payment record is incomplete (broken data)",
			},
			{
				status: 403,
				message: "You have no rights to refund this booking",
				when: "The booking belongs to another user",
			},
			{
				status: 404,
				message: "Payment not found",
				when: "No payment for this booking id",
			},
			{
				status: 404,
				message: "Order not found",
				when: "The payment exists but its booking does not",
			},
			SCREENING_NOT_FOUND,
			{
				status: 500,
				message: "LiqPay refund failed",
				when: "LiqPay rejected the refund (the message is LiqPay's error description when it gives one). The booking is already canceled; send the request again to retry",
			},
			{
				status: 503,
				message:
					"Booking was canceled, but the refund could not be processed. Please try again.",
				when: "LiqPay could not be reached. The booking is already canceled; send the request again to retry",
			},
		],
	})
	@Throttle({ default: { limit: 10, ttl: 60000 } })
	@Protected()
	@Post("refund/:id")
	@HttpCode(HttpStatus.OK)
	public async refundPayment(
		@Param("id") bookingId: string,
		@CurrentUser() userId: string,
	) {
		return this.client.call("refundPayment", {
			bookingId,
			userId,
		});
	}
}
