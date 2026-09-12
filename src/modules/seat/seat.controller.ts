import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { GetSeatsByHallResponse } from "./dto";
import { SeatClientGrpc } from "./seat.grpc";

@Controller("seats")
export class SeatController {
	public constructor(private readonly client: SeatClientGrpc) {}

	@ApiOperation({
		summary: "Get seats by hall",
		description:
			"Returns the list of seats for a hall and their availability for a given screening.",
	})
	@ApiOkResponse({ type: [GetSeatsByHallResponse] })
	@Get(":hall_id/:screening_id")
	@HttpCode(HttpStatus.OK)
	public async listSeatsByHall(
		@Param("hall_id") hallId: string,
		@Param("screening_id") screeningId: string,
	) {
		const response = await this.client.call("listSeatsByHall", {
			hallId,
			screeningId,
		});

		return Array.isArray(response.seats) ? response.seats : [];
	}
}
