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
	ApiQuery,
	ApiTags,
} from "@nestjs/swagger";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";
import { ApiErrors, type ApiErrorSpec } from "@/shared/swagger";

import {
	CreateHallRequest,
	CreateHallResponse,
	DeleteHallResponse,
	GetHallResponse,
	GetHallsResponse,
	UpdateHallRequest,
	UpdateHallResponse,
} from "./dto";
import { HallClientGrpc } from "./hall.grpc";

const ID_PARAM = {
	name: "id",
	description: "Hall id",
	example: "tZwcb0sTC-0eiRZHm59r9",
};

const HALL_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "Hall not found",
	when: "No hall with this id",
};

@ApiTags("Halls")
@Controller("halls")
export class HallController {
	public constructor(private readonly client: HallClientGrpc) {}

	@ApiOperation({
		summary: "List halls of a theater",
		description:
			"Returns all halls of a theater, sorted by name. Public, no authorization " +
			"needed. Returns an empty array when the theater has no halls, doesn't " +
			"exist, or `theaterId` is not given.",
	})
	@ApiQuery({
		name: "theaterId",
		required: false,
		description: "Theater id",
		example: "81lI6j9Ctva6e7oCPpelc",
	})
	@ApiOkResponse({
		type: [GetHallsResponse],
		description: "Halls of the theater",
	})
	@ApiErrors()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query("theaterId") theaterId: string) {
		const { halls } = await this.client.call("listHallsByTheater", {
			theaterId,
		});

		// gRPC omits empty lists: no halls arrives as undefined
		return halls ?? [];
	}

	@ApiOperation({
		summary: "Get hall",
		description: "Returns one hall by id. Public, no authorization needed.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({ type: GetHallResponse, description: "The hall" })
	@ApiErrors({ errors: [HALL_NOT_FOUND] })
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const { hall } = await this.client.call("getHall", { id });

		return hall;
	}

	@ApiOperation({
		summary: "Create hall",
		description:
			"Creates a hall together with all its seats. **Admin only.**\n\n" +
			"Seats are generated from `layout`: for each row, seats 1..`columns` with " +
			"that row's type and price. The hall and its seats are created in one " +
			"transaction — if anything fails, nothing is created.\n\n" +
			"The layout can't be changed later; to change it, delete the hall and " +
			"create it again.",
	})
	@ApiCreatedResponse({
		type: CreateHallResponse,
		description: "The created hall",
	})
	@ApiErrors({
		auth: "admin",
		validation: [
			"name must be a string",
			"name should not be empty",
			"theaterId must be a string",
			"theaterId should not be empty",
			"layout must be an array",
			"layout.0.row must be an integer number",
			"layout.0.columns must be an integer number",
			"layout.0.type must be one of the following values: standard, vip, premium",
			"layout.0.price must be an integer number",
		],
		errors: [
			{
				status: 404,
				message: "Theater not found",
				when: "No theater with this `theaterId`",
			},
			{
				status: 500,
				message: "Internal server error",
				when: "`layout` has the same `row` more than once (duplicate seats)",
			},
		],
	})
	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateHallRequest) {
		return await this.client.call("createHall", dto);
	}

	@ApiOperation({
		summary: "Update hall",
		description:
			"Renames a hall. Only `name` can be changed; the seat layout stays as it " +
			"is. An empty body changes nothing and returns the hall. **Admin only.**",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({
		type: UpdateHallResponse,
		description: "The hall after the update",
	})
	@ApiErrors({
		auth: "admin",
		validation: ["name must be a string", "name should not be empty"],
		errors: [HALL_NOT_FOUND],
	})
	@Protected(Role.ADMIN)
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	public async update(
		@Param("id") id: string,
		@Body() dto: UpdateHallRequest,
	) {
		const { hall } = await this.client.call("updateHall", { id, ...dto });

		return { hall };
	}

	@ApiOperation({
		summary: "Delete hall",
		description:
			"Deletes a hall and all its seats. **Admin only.**\n\n" +
			"Not possible while the hall has upcoming screenings. Past screenings " +
			"and their bookings stay, but no longer show the hall.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({ type: DeleteHallResponse, description: "Hall deleted" })
	@ApiErrors({
		auth: "admin",
		errors: [
			{
				status: 400,
				message: "Cannot delete hall with upcoming screenings",
				when: "The hall still has screenings in the future",
			},
			HALL_NOT_FOUND,
		],
	})
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		return await this.client.call("deleteHall", { id });
	}
}
