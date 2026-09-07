import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query,
} from "@nestjs/common";

import { GetMoviesRequest } from "./dto";
import { MovieClientGrpc } from "./movie.grpc";
import { MovieMapper } from "./movie.mapper";

@Controller("movies")
export class MovieController {
	public constructor(private readonly client: MovieClientGrpc) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetMoviesRequest) {
		const response = await this.client.call("listMovies", dto);

		return Array.isArray(response.movies)
			? response.movies.map(movie => MovieMapper.toMovie(movie))
			: [];
	}

	@Get(":slug")
	@HttpCode(HttpStatus.OK)
	public async getBySlug(@Param("slug") slug: string) {
		const { movie } = await this.client.call("getMovie", { slug });

		return MovieMapper.toMovie(movie);
	}
}
