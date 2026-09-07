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

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";

import { CreateHallRequest } from "./dto";
import { HallClientGrpc } from "./hall.grpc";

@Controller("halls")
export class HallController {
	public constructor(private readonly client: HallClientGrpc) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query("theaterId") theaterId: string) {
		const { halls } = await this.client.call("listHallsByTheater", {
			theaterId,
		});

		return halls;
	}

	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const { hall } = await this.client.call("getHall", { id });

		return hall;
	}

	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateHallRequest) {
		return await this.client.call("createHall", dto);
	}
}
