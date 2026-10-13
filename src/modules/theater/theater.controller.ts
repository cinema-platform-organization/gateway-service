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
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from "@nestjs/swagger";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";
import { ApiErrors, type ApiErrorSpec } from "@/shared/swagger";

import {
	CreateTheaterRequest,
	CreateTheaterResponse,
	DeleteTheaterResponse,
	GetTheatersResponse,
	UpdateTheaterRequest,
	UpdateTheaterResponse,
} from "./dto";
import { TheaterClientGrpc } from "./theater.grpc";

const ID_PARAM = {
	name: "id",
	description: "Theater id",
	example: "81lI6j9Ctva6e7oCPpelc",
};

const THEATER_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "Theater not found",
	when: "No theater with this id",
};

const THEATER_VALIDATION = [
	"name must be a string",
	"name should not be empty",
	"address must be a string",
	"address should not be empty",
];

@ApiTags("Theaters")
@Controller("theaters")
export class TheaterController {
	public constructor(private readonly client: TheaterClientGrpc) {}

	@ApiOperation({
		summary: "List theaters",
		description:
			"Returns all theaters, sorted by name. Public, no authorization needed. " +
			"Returns an empty array when there are none.",
	})
	@ApiOkResponse({
		type: [GetTheatersResponse],
		description: "All theaters",
	})
	@ApiErrors()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		const response = await this.client.call("listTheaters", {});

		return Array.isArray(response.theaters) ? response.theaters : [];
	}

	@ApiOperation({
		summary: "Get theater",
		description:
			"Returns one theater by id. Public, no authorization needed.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({ type: GetTheatersResponse, description: "The theater" })
	@ApiErrors({ errors: [THEATER_NOT_FOUND] })
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const response = await this.client.call("getTheater", { id });

		return response.theater;
	}

	@ApiOperation({
		summary: "Create theater",
		description:
			"Creates a theater without halls; add halls with POST /halls. **Admin only.**",
	})
	@ApiCreatedResponse({
		type: CreateTheaterResponse,
		description: "The created theater",
	})
	@ApiErrors({ auth: "admin", validation: THEATER_VALIDATION })
	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateTheaterRequest) {
		return await this.client.call("createTheater", dto);
	}

	@ApiOperation({
		summary: "Update theater",
		description:
			"Changes only the fields that are sent; the rest stay as they are. " +
			"An empty body changes nothing and returns the theater. **Admin only.**",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({
		type: UpdateTheaterResponse,
		description: "The theater after the update",
	})
	@ApiErrors({
		auth: "admin",
		validation: THEATER_VALIDATION,
		errors: [THEATER_NOT_FOUND],
	})
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

		return { theater: response.theater };
	}

	@ApiOperation({
		summary: "Delete theater",
		description:
			"Deletes a theater together with **all its halls and their seats**. " +
			"**Admin only.**\n\n" +
			"Not possible while any of its halls has upcoming screenings. Past " +
			"screenings and their bookings stay, but no longer show the theater or hall.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({
		type: DeleteTheaterResponse,
		description: "Theater, halls and seats deleted",
	})
	@ApiErrors({
		auth: "admin",
		errors: [
			{
				status: 400,
				message: "Cannot delete theater with upcoming screenings",
				when: "Any hall of the theater still has screenings in the future",
			},
			THEATER_NOT_FOUND,
		],
	})
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		return await this.client.call("deleteTheater", { id });
	}
}
