import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
} from "@nestjs/swagger";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";

import {
	CreateHallRequest,
	CreateHallResponse,
	DeleteHallResponse,
	GetHallResponse,
	GetHallsResponse,
	UpdateHallRequest,
	UpdateHallResponse,
} from "./dto";
import { HallClientGrpc } from "./hall.grpc";

@Controller("halls")
export class HallController {
	public constructor(private readonly client: HallClientGrpc) {}

	@ApiOperation({
		summary: "Get halls by theater",
		description: "Returns the list of halls belonging to a given theater.",
	})
	@ApiOkResponse({ type: [GetHallsResponse] })
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query("theaterId") theaterId: string) {
		const { halls } = await this.client.call("listHallsByTheater", {
			theaterId,
		});

		return halls;
	}

	@ApiOperation({
		summary: "Get hall by id",
		description: "Returns a single hall by its id.",
	})
	@ApiOkResponse({ type: GetHallResponse })
	@ApiNotFoundResponse()
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const { hall } = await this.client.call("getHall", { id });

		return hall;
	}

	@ApiOperation({
		summary: "Create hall",
		description: "Creates a new hall. Admin only.",
	})
	@ApiOkResponse({ type: CreateHallResponse })
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateHallRequest) {
		return await this.client.call("createHall", dto);
	}

	@ApiOperation({
		summary: "Update hall",
		description:
			"Updates a hall. Only provided fields are changed. Admin only.",
	})
	@ApiOkResponse({ type: UpdateHallResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	public async update(
		@Param("id") id: string,
		@Body() dto: UpdateHallRequest,
	) {
		const { hall } = await this.client.call("updateHall", { id, ...dto });

		return hall;
	}

	@ApiOperation({
		summary: "Delete hall",
		description:
			"Deletes a hall. Fails if the hall has upcoming screenings. Admin only.",
	})
	@ApiOkResponse({ type: DeleteHallResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		return await this.client.call("deleteHall", { id });
	}
}
