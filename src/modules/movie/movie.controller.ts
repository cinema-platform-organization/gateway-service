import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import {
	GetMoviesRequest,
	GetMoviesResponse,
	PaginatedMoviesResponse,
} from "./dto";
import { MovieClientGrpc } from "./movie.grpc";
import { MovieMapper } from "./movie.mapper";

@Controller("movies")
export class MovieController {
	public constructor(private readonly client: MovieClientGrpc) {}

	@ApiOperation({
		summary: "Get movies",
		description: "Returns a paginated, filtered list of movies.",
	})
	@ApiOkResponse({ type: PaginatedMoviesResponse })
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetMoviesRequest) {
		const response = await this.client.call("listMovies", dto);
		const movies = Array.isArray(response.movies)
			? response.movies.map(movie => MovieMapper.toMovie(movie))
			: [];

		const page = dto.random ? 1 : dto.page;

		return {
			data: movies,
			page,
			limit: dto.limit,
			total: response.total,
			totalPages: dto.random ? 1 : Math.ceil(response.total / dto.limit),
		};
	}

	@ApiOperation({
		summary: "Get movie by slug",
		description: "Returns a single movie by its slug.",
	})
	@ApiOkResponse({ type: GetMoviesResponse })
	@Get(":slug")
	@HttpCode(HttpStatus.OK)
	public async getBySlug(@Param("slug") slug: string) {
		const { movie } = await this.client.call("getMovie", { slug });

		return MovieMapper.toMovie(movie);
	}
}
