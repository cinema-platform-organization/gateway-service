import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Query,
} from "@nestjs/common";
import {
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";
import { ApiErrors, type ApiErrorSpec } from "@/shared/swagger";

import {
	DeleteSeatResponse,
	GetSeatResponse,
	GetSeatsByHallResponse,
	UpdateSeatRequest,
	UpdateSeatResponse,
} from "./dto";
import { SeatClientGrpc } from "./seat.grpc";

const ID_PARAM = {
	name: "id",
	description: "Seat id",
	example: "kM2vRwYpQ8sN-4LzXbT7d",
};

const SEAT_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "Seat not found",
	when: "No seat with this id",
};

@ApiTags("Seats")
@Controller("seats")
export class SeatController {
	public constructor(private readonly client: SeatClientGrpc) {}

	@ApiOperation({
		summary: "List seats of a hall",
		description:
			"Returns all seats of a hall, sorted by row and then by number. Public, " +
			"no authorization needed.\n\n" +
			"With `screeningId`, every seat gets a `status` (`available` or " +
			"`reserved`) for that screening — use it for the seat picker. Without it, " +
			"seats have no `status`.\n\n" +
			"An unknown hall returns an empty array; an unknown screening returns all " +
			"seats as `available`.",
	})
	@ApiParam({
		name: "hallId",
		description: "Hall id",
		example: "tZwcb0sTC-0eiRZHm59r9",
	})
	@ApiQuery({
		name: "screeningId",
		required: false,
		description: "Screening to check seat availability for",
		example: "665f1c2e8a1b2c3d4e5f6a7b",
	})
	@ApiOkResponse({
		type: [GetSeatsByHallResponse],
		description: "Seats of the hall",
	})
	@ApiErrors({ throttle: 120 })
	@Throttle({ default: { limit: 120, ttl: 60000 } })
	@Get("hall/:hallId")
	@HttpCode(HttpStatus.OK)
	public async listSeatsByHall(
		@Param("hallId") hallId: string,
		@Query("screeningId") screeningId?: string,
	) {
		const response = await this.client.call("listSeatsByHall", {
			hallId,
			screeningId,
		});

		return Array.isArray(response.seats) ? response.seats : [];
	}

	@ApiOperation({
		summary: "Get seat",
		description:
			"Returns one seat by id, for the admin edit form. **Admin only.** " +
			"`status` is always `unknown` here.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({ type: GetSeatResponse, description: "The seat" })
	@ApiErrors({ auth: "admin", errors: [SEAT_NOT_FOUND] })
	@Protected(Role.ADMIN)
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const { seat } = await this.client.call("getSeat", { id });

		return seat;
	}

	@ApiOperation({
		summary: "Update seat",
		description:
			"Changes a seat's price and/or type; fields left out stay as they are. " +
			"An empty body changes nothing and returns the seat. **Admin only.**\n\n" +
			"A new price applies to new bookings only; tickets already bought keep " +
			"their price.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({
		type: UpdateSeatResponse,
		description: "The seat after the update",
	})
	@ApiErrors({
		auth: "admin",
		validation: [
			"price must be an integer number",
			"type must be one of the following values: standard, vip, premium",
		],
		errors: [SEAT_NOT_FOUND],
	})
	@Protected(Role.ADMIN)
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	public async update(
		@Param("id") id: string,
		@Body() dto: UpdateSeatRequest,
	) {
		const { seat } = await this.client.call("updateSeat", { id, ...dto });

		return { seat };
	}

	@ApiOperation({
		summary: "Delete seat",
		description:
			"Deletes one seat from its hall. Other seats keep their row and number. " +
			"**Admin only.**\n\n" +
			"Not possible while the hall has upcoming screenings.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({ type: DeleteSeatResponse, description: "Seat deleted" })
	@ApiErrors({
		auth: "admin",
		errors: [
			{
				status: 400,
				message: "Cannot delete seat: hall has upcoming screenings",
				when: "The seat's hall still has screenings in the future",
			},
			SEAT_NOT_FOUND,
		],
	})
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		return await this.client.call("deleteSeat", { id });
	}
}
