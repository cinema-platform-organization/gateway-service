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
	CreateTheaterRequest,
	CreateTheaterResponse,
	DeleteTheaterResponse,
	GetTheatersResponse,
	UpdateTheaterRequest,
	UpdateTheaterResponse,
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
		summary: "Get theater by id",
		description: "Returns a single theater by its id.",
	})
	@ApiOkResponse({ type: GetTheatersResponse })
	@ApiNotFoundResponse()
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const response = await this.client.call("getTheater", { id });

		return response.theater;
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

	@ApiOperation({
		summary: "Update theater",
		description:
			"Updates a theater. Only provided fields are changed. Admin only.",
	})
	@ApiOkResponse({ type: UpdateTheaterResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	public async update(
		@Param("id") id: string,
		@Body() dto: UpdateTheaterRequest,
	) {
		const response = await this.client.call("updateTheater", {
			id,
			...dto,
		});

		return response.theater;
	}

	@ApiOperation({
		summary: "Delete theater",
		description:
			"Deletes a theater. Fails if the theater has upcoming screenings. Admin only.",
	})
	@ApiOkResponse({ type: DeleteTheaterResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		return await this.client.call("deleteTheater", { id });
	}
}
