import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";

import {
	CreateHallRequest,
	CreateHallResponse,
	GetHallResponse,
	GetHallsResponse,
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
	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateHallRequest) {
		return await this.client.call("createHall", dto);
	}
}
