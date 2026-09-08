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

import { CreateScreeningRequest, GetScreeningsRequest } from "./dto";
import { ScreeningClientGrpc } from "./screening.grpc";

@Controller("screenings")
export class ScreeningController {
	public constructor(private readonly client: ScreeningClientGrpc) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateScreeningRequest) {
		return this.client.call("createScreening", dto);
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetScreeningsRequest) {
		const response = await this.client.call("getScreenings", dto);

		return Array.isArray(response.screenings) ? response.screenings : [];
	}

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

	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const response = await this.client.call("getScreening", { id });

		return response.screening;
	}
}
