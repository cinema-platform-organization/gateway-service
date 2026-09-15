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
	ApiBearerAuth,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";

import {
	DeleteSeatResponse,
	GetSeatResponse,
	GetSeatsByHallResponse,
	UpdateSeatRequest,
	UpdateSeatResponse,
} from "./dto";
import { SeatClientGrpc } from "./seat.grpc";

@Controller("seats")
export class SeatController {
	public constructor(private readonly client: SeatClientGrpc) {}

	@ApiOperation({
		summary: "Get seats by hall",
		description:
			"Returns the list of seats for a hall. If a screeningId is provided, includes reservation status for that screening.",
	})
	@ApiOkResponse({ type: [GetSeatsByHallResponse] })
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
		summary: "Get seat by id",
		description: "Returns a single seat by its id, for admin editing.",
	})
	@ApiOkResponse({ type: GetSeatResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
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
			"Updates a seat's price or type. Only provided fields are changed. Admin only.",
	})
	@ApiOkResponse({ type: UpdateSeatResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	public async update(
		@Param("id") id: string,
		@Body() dto: UpdateSeatRequest,
	) {
		const { seat } = await this.client.call("updateSeat", { id, ...dto });

		return seat;
	}

	@ApiOperation({
		summary: "Delete seat",
		description:
			"Deletes a seat. Fails if its hall has upcoming screenings. Admin only.",
	})
	@ApiOkResponse({ type: DeleteSeatResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		return await this.client.call("deleteSeat", { id });
	}
}
