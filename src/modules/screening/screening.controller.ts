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
	CreateScreeningRequest,
	CreateScreeningResponse,
	DeleteScreeningResponse,
	GetScreeningResponse,
	GetScreeningsByMovieRequest,
	GetScreeningsRequest,
	PaginatedScreeningsResponse,
	UpdateScreeningRequest,
	UpdateScreeningResponse,
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
	@ApiNotFoundResponse()
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const response = await this.client.call("getScreening", { id });

		return response.screening;
	}

	@ApiOperation({
		summary: "Update screening",
		description:
			"Updates a screening's movie, hall, or time. Only provided fields are changed. Admin only.",
	})
	@ApiOkResponse({ type: UpdateScreeningResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	public async update(
		@Param("id") id: string,
		@Body() dto: UpdateScreeningRequest,
	) {
		const response = await this.client.call("updateScreening", {
			id,
			...dto,
		});

		return response.screening;
	}

	@ApiOperation({
		summary: "Delete screening",
		description:
			"Deletes a screening. Fails if it already has bookings. Admin only.",
	})
	@ApiOkResponse({ type: DeleteScreeningResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		return await this.client.call("deleteScreening", { id });
	}
}
