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

import { CategoryClientGrpc } from "./category.grpc";
import {
	CreateCategoryRequest,
	CreateCategoryResponse,
	DeleteCategoryResponse,
	GetCategoriesResponse,
	UpdateCategoryRequest,
	UpdateCategoryResponse,
} from "./dto";

@Controller("categories")
export class CategoryController {
	public constructor(private readonly client: CategoryClientGrpc) {}

	@ApiOperation({
		summary: "Get all categories",
		description: "Returns the list of all available categories.",
	})
	@ApiOkResponse({ type: [GetCategoriesResponse] })
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		const response = await this.client.call("getAllCategories", {});

		return Array.isArray(response.categories) ? response.categories : [];
	}

	@ApiOperation({
		summary: "Get category by id",
		description: "Returns a single category by its id.",
	})
	@ApiOkResponse({ type: GetCategoriesResponse })
	@ApiNotFoundResponse()
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const { category } = await this.client.call("getCategory", { id });

		return category;
	}

	@ApiOperation({
		summary: "Create category",
		description: "Creates a new category. Admin only.",
	})
	@ApiOkResponse({ type: CreateCategoryResponse })
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() dto: CreateCategoryRequest) {
		const { category } = await this.client.call("createCategory", dto);

		return category;
	}

	@ApiOperation({
		summary: "Update category",
		description:
			"Updates a category. Only provided fields are changed. Admin only.",
	})
	@ApiOkResponse({ type: UpdateCategoryResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	public async update(
		@Param("id") id: string,
		@Body() dto: UpdateCategoryRequest,
	) {
		const { category } = await this.client.call("updateCategory", {
			id,
			...dto,
		});

		return category;
	}

	@ApiOperation({
		summary: "Delete category",
		description:
			"Deletes a category. Fails if any movies still reference it. Admin only.",
	})
	@ApiOkResponse({ type: DeleteCategoryResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		return await this.client.call("deleteCategory", { id });
	}
}
