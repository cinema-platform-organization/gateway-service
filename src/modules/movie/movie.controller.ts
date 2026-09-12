import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { GetMoviesRequest, GetMoviesResponse } from "./dto";
import { MovieClientGrpc } from "./movie.grpc";
import { MovieMapper } from "./movie.mapper";

@Controller("movies")
export class MovieController {
	public constructor(private readonly client: MovieClientGrpc) {}

	@ApiOperation({
		summary: "Get movies",
		description: "Returns a filtered list of movies.",
	})
	@ApiOkResponse({ type: [GetMoviesResponse] })
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetMoviesRequest) {
		const response = await this.client.call("listMovies", dto);

		return Array.isArray(response.movies)
			? response.movies.map(movie => MovieMapper.toMovie(movie))
			: [];
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
