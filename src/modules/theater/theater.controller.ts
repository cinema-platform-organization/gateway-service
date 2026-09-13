import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";

import {
	CreateTheaterRequest,
	CreateTheaterResponse,
	GetTheatersResponse,
} from "./dto";
import { TheaterClientGrpc } from "./theater.grpc";

@Controller("theaters")
export class TheaterController {
	public constructor(private readonly client: TheaterClientGrpc) {}

	@ApiOperation({
		summary: "Get all theaters",
		description: "Returns the list of all theaters.",
	})
	@ApiOkResponse({ type: [GetTheatersResponse] })
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		const response = await this.client.call("listTheaters", {});

		return Array.isArray(response.theaters) ? response.theaters : [];
	}

	@ApiOperation({
		summary: "Create theater",
		description: "Creates a new theater. Admin only.",
	})
	@ApiOkResponse({ type: CreateTheaterResponse })
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateTheaterRequest) {
		return await this.client.call("createTheater", dto);
	}
}
