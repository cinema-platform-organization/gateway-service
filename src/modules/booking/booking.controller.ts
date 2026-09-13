import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { CurrentUser, Protected } from "@/shared/decorators";

import { BookingClientGrpc } from "./booking.grpc";
import { GetBookingsRequest, PaginatedBookingsResponse } from "./dto";

@Controller("bookings")
export class BookingController {
	public constructor(private readonly booking: BookingClientGrpc) {}

	@ApiOperation({
		summary: "Get user bookings",
		description:
			"Returns a paginated list of bookings for the current user.",
	})
	@ApiOkResponse({ type: PaginatedBookingsResponse })
	@ApiBearerAuth()
	@Protected()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getBookings(
		@CurrentUser() userId: string,
		@Query() dto: GetBookingsRequest,
	) {
		const response = await this.booking.call("getUserBookings", {
			userId,
			limit: dto.limit,
			page: dto.page,
		});

		const bookings = Array.isArray(response.bookings)
			? response.bookings
			: [];

		return {
			data: bookings,
			page: dto.page,
			limit: dto.limit,
			total: response.total,
			totalPages: Math.ceil(response.total / dto.limit),
		};
	}
}
