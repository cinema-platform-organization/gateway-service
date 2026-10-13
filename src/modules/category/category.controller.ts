import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
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

import { CategoryClientGrpc } from "./category.grpc";
import {
	CreateCategoryRequest,
	CreateCategoryResponse,
	DeleteCategoryResponse,
	GetCategoriesResponse,
	UpdateCategoryRequest,
	UpdateCategoryResponse,
} from "./dto";

const ID_PARAM = {
	name: "id",
	description: "Category id",
	format: "uuid",
	example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
};

const INVALID_ID: ApiErrorSpec = {
	status: 400,
	message: "Validation failed (uuid is expected)",
	when: "`id` is not a valid UUID",
};

const CATEGORY_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "Category not found",
	when: "No category with this id",
};

const DUPLICATE_SLUG: ApiErrorSpec = {
	status: 500,
	message: "Internal server error",
	when: "`slug` is already used by another category (unique constraint)",
};

const TITLE_VALIDATION = [
	"title must be a string",
	"title should not be empty",
	"title must be shorter than or equal to 255 characters",
];

const SLUG_VALIDATION = [
	"slug must be a string",
	"slug must be shorter than or equal to 255 characters",
];

@ApiTags("Categories")
@Controller("categories")
export class CategoryController {
	public constructor(private readonly client: CategoryClientGrpc) {}

	@ApiOperation({
		summary: "List categories",
		description:
			"Returns all categories, newest first. Public, no authorization needed. " +
			"Returns an empty array when there are none.",
	})
	@ApiOkResponse({
		type: [GetCategoriesResponse],
		description: "All categories",
	})
	@ApiErrors()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		const response = await this.client.call("getAllCategories", {});

		return Array.isArray(response.categories) ? response.categories : [];
	}

	@ApiOperation({
		summary: "Get category",
		description:
			"Returns one category by id. Public, no authorization needed.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({ type: GetCategoriesResponse, description: "The category" })
	@ApiErrors({ errors: [INVALID_ID, CATEGORY_NOT_FOUND] })
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id", ParseUUIDPipe) id: string) {
		const { category } = await this.client.call("getCategory", { id });

		return category;
	}

	@ApiOperation({
		summary: "Create category",
		description:
			"Creates a category. **Admin only.**\n\n" +
			"`slug` is optional, but without it the category can't be used in the " +
			"movie filter (`GET /movies?category=<slug>`).",
	})
	@ApiCreatedResponse({
		type: CreateCategoryResponse,
		description: "The created category",
	})
	@ApiErrors({
		auth: "admin",
		validation: [...TITLE_VALIDATION, ...SLUG_VALIDATION],
		errors: [DUPLICATE_SLUG],
	})
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
			"Changes only the fields that are sent; the rest stay as they are. " +
			"At least one field is required. **Admin only.**",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({
		type: UpdateCategoryResponse,
		description: "The category after the update",
	})
	@ApiErrors({
		auth: "admin",
		validation: [...TITLE_VALIDATION, ...SLUG_VALIDATION],
		errors: [
			INVALID_ID,
			{
				status: 400,
				message: "Nothing to update",
				when: "Body has neither `title` nor `slug`",
			},
			CATEGORY_NOT_FOUND,
			DUPLICATE_SLUG,
		],
	})
	@Protected(Role.ADMIN)
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	public async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateCategoryRequest,
	) {
		if (dto.title === undefined && dto.slug === undefined) {
			throw new BadRequestException("Nothing to update");
		}

		const { category } = await this.client.call("updateCategory", {
			id,
			...dto,
		});

		return category;
	}

	@ApiOperation({
		summary: "Delete category",
		description:
			"Deletes a category. Only possible when no movie belongs to it — " +
			"move or delete those movies first. **Admin only.**",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({
		type: DeleteCategoryResponse,
		description: "Category deleted",
	})
	@ApiErrors({
		auth: "admin",
		errors: [
			INVALID_ID,
			{
				status: 400,
				message: "Cannot delete category with existing movies",
				when: "At least one movie still belongs to this category",
			},
			CATEGORY_NOT_FOUND,
		],
	})
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id", ParseUUIDPipe) id: string) {
		return await this.client.call("deleteCategory", { id });
	}
}
