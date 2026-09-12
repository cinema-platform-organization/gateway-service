import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { CategoryClientGrpc } from "./category.grpc";
import { GetCategoriesResponse } from "./dto";

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
}
