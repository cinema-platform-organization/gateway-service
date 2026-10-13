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

const ID_PARAM = {
	name: "id",
	description: "Screening id",
	example: "YszAkVVKt6Y4RTjfpmnrT",
};

const SCREENING_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "Screening not found",
	when: "No screening with this id",
};

const HALL_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "Hall not found",
	when: "No hall with this `hallId`",
};

const END_BEFORE_START: ApiErrorSpec = {
	status: 400,
	message: "endAt must be after startAt",
	when: "The end time is not later than the start time",
};

const OVERLAP: ApiErrorSpec = {
	status: 409,
	message: "Overlaps with existing screening",
	when: "Another screening in the same hall overlaps this time range",
};

const LIST_VALIDATION = [
	"date must be a valid ISO 8601 date string",
	"limit must be an integer number",
	"limit must not be less than 1",
	"limit must not be greater than 100",
	"page must be an integer number",
	"page must not be less than 1",
];

@ApiTags("Screenings")
@Controller("screenings")
export class ScreeningController {
	public constructor(private readonly client: ScreeningClientGrpc) {}

	@ApiOperation({
		summary: "Create screening",
		description:
			"Schedules a movie in a hall. **Admin only.**\n\n" +
			"Checks that `endAt` is after `startAt`, that the hall exists and that no " +
			"other screening in that hall overlaps the time range. The movie id is " +
			"**not** checked.\n\n" +
			"Send times with a time zone offset; times without one are read as UTC.",
	})
	@ApiCreatedResponse({
		type: CreateScreeningResponse,
		description: "Screening created",
	})
	@ApiErrors({
		auth: "admin",
		validation: [
			"movieId must be a string",
			"movieId should not be empty",
			"hallId must be a string",
			"hallId should not be empty",
			"startAt must be a valid ISO 8601 date string",
			"endAt must be a valid ISO 8601 date string",
		],
		errors: [END_BEFORE_START, HALL_NOT_FOUND, OVERLAP],
	})
	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateScreeningRequest) {
		return this.client.call("createScreening", dto);
	}

	@ApiOperation({
		summary: "List screenings",
		description:
			"Returns screenings with their movie, hall, theater and seat prices, " +
			"earliest first. Public, no authorization needed.\n\n" +
			"Filters: `theaterId` and `date`. With `date`, the whole day (UTC) is " +
			"returned at once and `limit`/`page` are ignored. Without `date`, " +
			"screenings of all days — past ones included — page by page.",
	})
	@ApiOkResponse({
		type: PaginatedScreeningsResponse,
		description: "Matching screenings",
	})
	@ApiErrors({
		validation: ["theaterId must be a string", ...LIST_VALIDATION],
	})
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetScreeningsRequest) {
		const response = await this.client.call("getScreenings", dto);
		const screenings = Array.isArray(response.screenings)
			? response.screenings
			: [];

		const total = response.total ?? 0;

		return {
			data: screenings,
			page: dto.page,
			limit: dto.limit,
			total,
			totalPages: Math.ceil(total / dto.limit),
		};
	}

	@ApiOperation({
		summary: "List screenings of a movie",
		description:
			"Returns screenings of one movie with their hall, theater and seat prices, " +
			"earliest first. Public, no authorization needed.\n\n" +
			"The items have **no `movie` field** here. With `date`, the whole day " +
			"(UTC) is returned at once and `limit`/`page` are ignored. An unknown " +
			"movie returns an empty list.",
	})
	@ApiParam({
		name: "id",
		description: "Movie id",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
	})
	@ApiOkResponse({
		type: PaginatedScreeningsResponse,
		description: "Screenings of the movie (without the `movie` field)",
	})
	@ApiErrors({ validation: LIST_VALIDATION })
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

		const total = response.total ?? 0;

		return {
			data: screenings,
			page: dto.page,
			limit: dto.limit,
			total,
			totalPages: Math.ceil(total / dto.limit),
		};
	}

	@ApiOperation({
		summary: "Get screening",
		description:
			"Returns one screening with its movie, hall, theater and seat prices. " +
			"Public, no authorization needed. For seat availability use " +
			"GET /seats/hall/{hallId}?screeningId=.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({ type: GetScreeningResponse, description: "The screening" })
	@ApiErrors({
		errors: [
			SCREENING_NOT_FOUND,
			{
				status: 500,
				message: "Screening exists but failed to load related data",
				when: "Its movie, hall or theater no longer exists (e.g. created with a wrong movie id)",
			},
		],
	})
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const response = await this.client.call("getScreening", { id });

		return response.screening;
	}

	@ApiOperation({
		summary: "Update screening",
		description:
			"Changes the movie, hall or times; fields left out stay as they are. " +
			"**Admin only.**\n\n" +
			"The resulting time range is checked again (end after start, no overlap " +
			"in the hall). Moving a screening that already has bookings is allowed: " +
			"existing tickets keep the old hall.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({
		type: UpdateScreeningResponse,
		description: "The screening after the update",
	})
	@ApiErrors({
		auth: "admin",
		validation: [
			"movieId must be a string",
			"hallId must be a string",
			"startAt must be a valid ISO 8601 date string",
			"endAt must be a valid ISO 8601 date string",
		],
		errors: [
			END_BEFORE_START,
			SCREENING_NOT_FOUND,
			HALL_NOT_FOUND,
			OVERLAP,
			{
				status: 500,
				message: "Screening updated but failed to load related data",
				when: "Saved, but its movie, hall or theater can't be loaded (e.g. a wrong movie id)",
			},
		],
	})
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

		return { screening: response.screening };
	}

	@ApiOperation({
		summary: "Delete screening",
		description:
			"Deletes a screening. Only possible while it has no tickets at all " +
			"(paid or awaiting payment). **Admin only.**",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({
		type: DeleteScreeningResponse,
		description: "Screening deleted",
	})
	@ApiErrors({
		auth: "admin",
		errors: [
			{
				status: 400,
				message: "Cannot delete screening with existing bookings",
				when: "The screening has at least one ticket",
			},
			SCREENING_NOT_FOUND,
		],
	})
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		return await this.client.call("deleteScreening", { id });
	}
}
