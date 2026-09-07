import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
} from "@nestjs/common";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";

import { CreateTheaterRequest } from "./dto";
import { TheaterClientGrpc } from "./theater.grpc";

@Controller("theaters")
export class TheaterController {
	public constructor(private readonly client: TheaterClientGrpc) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		const response = await this.client.call("listTheaters", {});

		return Array.isArray(response.theaters) ? response.theaters : [];
	}

	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateTheaterRequest) {
		return await this.client.call("createTheater", dto);
	}
}
