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
	CreateScreeningRequest,
	CreateScreeningResponse,
	GetScreeningResponse,
	GetScreeningsByMovieResponse,
	GetScreeningsRequest,
	GetScreeningsResponse,
} from "./dto";
import { ScreeningClientGrpc } from "./screening.grpc";

@Controller("screenings")
export class ScreeningController {
	public constructor(private readonly client: ScreeningClientGrpc) {}

	@ApiOperation({
		summary: "Create screening",
		description: "Creates a new screening.",
	})
	@ApiOkResponse({ type: CreateScreeningResponse })
	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateScreeningRequest) {
		return this.client.call("createScreening", dto);
	}

	@ApiOperation({
		summary: "Get screenings",
		description: "Returns a filtered list of screenings.",
	})
	@ApiOkResponse({ type: [GetScreeningsResponse] })
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetScreeningsRequest) {
		const response = await this.client.call("getScreenings", dto);

		return Array.isArray(response.screenings) ? response.screenings : [];
	}

	@ApiOperation({
		summary: "Get screenings by movie",
		description:
			"Returns screenings for a given movie, optionally filtered by date.",
	})
	@ApiOkResponse({ type: [GetScreeningsByMovieResponse] })
	@Get("movie/:id")
	@HttpCode(HttpStatus.OK)
	public async getByMovie(
		@Param("id") movieId: string,
		@Query("date") date?: string,
	) {
		const response = await this.client.call("getScreeningsByMovie", {
			movieId,
			date,
		});

		return Array.isArray(response.screenings) ? response.screenings : [];
	}

	@ApiOperation({
		summary: "Get screening by id",
		description: "Returns a single screening by its id.",
	})
	@ApiOkResponse({ type: GetScreeningResponse })
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const response = await this.client.call("getScreening", { id });

		return response.screening;
	}
}
