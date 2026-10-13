import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Protected } from "@/shared/decorators";
import { ApiErrors } from "@/shared/swagger";

import { BookingClientGrpc } from "./booking.grpc";
import { GetBookingsRequest, PaginatedBookingsResponse } from "./dto";

@ApiTags("Bookings")
@Controller("bookings")
export class BookingController {
	public constructor(private readonly booking: BookingClientGrpc) {}

	@ApiOperation({
		summary: "Get my bookings",
		description:
			"Returns the current user's paid bookings, page by page. Canceled and " +
			"unpaid orders are not included.\n\n" +
			"Each booking comes with the movie, theater, hall and booked seats, plus " +
			"the QR code to show at the entrance.\n\n" +
			"A page past the last one returns an empty `data` array. If a booking " +
			"points to a screening that no longer exists, it is skipped, so `data` " +
			"can be shorter than `limit` even when `total` says there are more.",
	})
	@ApiOkResponse({
		type: PaginatedBookingsResponse,
		description: "One page of bookings",
	})
	@ApiErrors({
		auth: "user",
		validation: [
			"limit must be an integer number",
			"limit must not be less than 1",
			"limit must not be greater than 100",
			"page must be an integer number",
			"page must not be less than 1",
		],
	})
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

		const total = response.total ?? 0;

		return {
			data: bookings,
			page: dto.page,
			limit: dto.limit,
			total,
			totalPages: Math.ceil(total / dto.limit),
		};
	}
}
