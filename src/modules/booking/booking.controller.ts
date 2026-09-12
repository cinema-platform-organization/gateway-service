import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { CurrentUser, Protected } from "@/shared/decorators";

import { BookingClientGrpc } from "./booking.grpc";
import { GetBookingsResponse } from "./dto";

@Controller("bookings")
export class BookingController {
	public constructor(private readonly booking: BookingClientGrpc) {}

	@ApiOperation({
		summary: "Get user bookings",
		description: "Returns the list of bookings for the current user.",
	})
	@ApiOkResponse({ type: [GetBookingsResponse] })
	@ApiBearerAuth()
	@Protected()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getBookings(@CurrentUser() userId: string) {
		const response = await this.booking.call("getUserBookings", {
			userId,
		});

		return Array.isArray(response.bookings) ? response.bookings : [];
	}
}
