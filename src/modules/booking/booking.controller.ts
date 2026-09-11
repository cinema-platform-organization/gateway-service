import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { CurrentUser, Protected } from "@/shared/decorators";

import { BookingClientGrpc } from "./booking.grpc";

@Controller("bookings")
export class BookingController {
	public constructor(private readonly booking: BookingClientGrpc) {}

	@ApiBearerAuth()
	@Protected()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getBookingMethods(@CurrentUser() userId: string) {
		const response = await this.booking.call("getUserBookings", {
			userId,
		});

		return Array.isArray(response.bookings) ? response.bookings : [];
	}
}
