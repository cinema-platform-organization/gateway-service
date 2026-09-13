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
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";

import {
	CreateScreeningRequest,
	CreateScreeningResponse,
	GetScreeningResponse,
	GetScreeningsByMovieRequest,
	GetScreeningsRequest,
	PaginatedScreeningsResponse,
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
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateScreeningRequest) {
		return this.client.call("createScreening", dto);
	}

	@ApiOperation({
		summary: "Get screenings",
		description: "Returns a paginated, filtered list of screenings.",
	})
	@ApiOkResponse({ type: PaginatedScreeningsResponse })
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetScreeningsRequest) {
		const response = await this.client.call("getScreenings", dto);
		const screenings = Array.isArray(response.screenings)
			? response.screenings
			: [];

		return {
			data: screenings,
			page: dto.page,
			limit: dto.limit,
			total: response.total,
			totalPages: Math.ceil(response.total / dto.limit),
		};
	}

	@ApiOperation({
		summary: "Get screenings by movie",
		description:
			"Returns a paginated list of screenings for a given movie, optionally filtered by date.",
	})
	@ApiOkResponse({ type: PaginatedScreeningsResponse })
	@Get("movie/:id")
	@HttpCode(HttpStatus.OK)
	public async getByMovie(
		@Param("id") movieId: string,
		@Query() dto: GetScreeningsByMovieRequest,
	) {
		const response = await this.client.call("getScreeningsByMovie", {
			movieId,
			date: dto.date,
			limit: dto.limit,
			page: dto.page,
		});
		const screenings = Array.isArray(response.screenings)
			? response.screenings
			: [];

		return {
			data: screenings,
			page: dto.page,
			limit: dto.limit,
			total: response.total,
			totalPages: Math.ceil(response.total / dto.limit),
		};
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
