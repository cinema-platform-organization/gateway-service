import {
	BadRequestException,
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
	UploadedFiles,
	UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
} from "@nestjs/swagger";
import { randomBytes } from "crypto";
import type { Express } from "express";
import "multer";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";
import { imageFilePipe } from "@/shared/utils";

import { MediaClientGrpc } from "../media/media.grpc";

import {
	CreateMovieRequest,
	CreateMovieResponse,
	DeleteMovieResponse,
	GetMovieResponse,
	GetMoviesRequest,
	PaginatedMoviesResponse,
	UpdateMovieRequest,
	UpdateMovieResponse,
} from "./dto";
import { MovieClientGrpc } from "./movie.grpc";
import { MovieMapper } from "./movie.mapper";

type MovieFiles = {
	poster?: Express.Multer.File[];
	banner?: Express.Multer.File[];
};

@Controller("movies")
export class MovieController {
	public constructor(
		private readonly client: MovieClientGrpc,
		private readonly mediaClient: MediaClientGrpc,
	) {}

	@ApiOperation({
		summary: "Get movies",
		description: "Returns a paginated, filtered list of movies.",
	})
	@ApiOkResponse({ type: PaginatedMoviesResponse })
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetMoviesRequest) {
		const response = await this.client.call("listMovies", {
			category: dto.category ?? "",
			random: dto.random ?? false,
			limit: dto.limit,
			page: dto.page,
		});
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
		summary: "Get movie by id",
		description: "Returns a single movie by its id, for admin editing.",
	})
	@ApiOkResponse({ type: GetMovieResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Get("id/:id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id") id: string) {
		const { movie } = await this.client.call("getMovie", { id });

		return MovieMapper.toMovie(movie);
	}

	@ApiOperation({
		summary: "Get movie by slug",
		description: "Returns a single movie by its slug.",
	})
	@ApiOkResponse({ type: GetMovieResponse })
	@ApiNotFoundResponse()
	@Get(":slug")
	@HttpCode(HttpStatus.OK)
	public async getBySlug(@Param("slug") slug: string) {
		const { movie } = await this.client.call("getMovie", { slug });

		return MovieMapper.toMovie(movie);
	}

	@ApiOperation({
		summary: "Create movie",
		description:
			"Creates a new movie with a poster and optional banner. Admin only.",
	})
	@ApiOkResponse({ type: CreateMovieResponse })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				poster: { type: "string", format: "binary" },
				banner: { type: "string", format: "binary" },
			},
		},
	})
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: "poster", maxCount: 1 },
			{ name: "banner", maxCount: 1 },
		]),
	)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async create(
		@Body() dto: CreateMovieRequest,
		@UploadedFiles() files: MovieFiles,
	) {
		const posterFile = files?.poster?.[0];

		if (!posterFile) {
			throw new BadRequestException("Poster image is required");
		}

		await imageFilePipe({ required: true }).transform(posterFile);

		const bannerFile = files?.banner?.[0];
		if (bannerFile) {
			await imageFilePipe({ required: false }).transform(bannerFile);
		}

		const posterUpload = await this.mediaClient.call("upload", {
			fileName: randomBytes(16).toString("hex"),
			folder: "movies",
			contentType: posterFile.mimetype,
			data: new Uint8Array(posterFile.buffer),
		});

		let bannerKey: string | undefined;
		if (bannerFile) {
			const bannerUpload = await this.mediaClient.call("upload", {
				fileName: randomBytes(16).toString("hex"),
				folder: "movies",
				contentType: bannerFile.mimetype,
				data: new Uint8Array(bannerFile.buffer),
			});
			bannerKey = bannerUpload.key;
		}

		const { movie } = await this.client.call("createMovie", {
			title: dto.title,
			slug: dto.slug,
			description: dto.description,
			poster: posterUpload.key,
			banner: bannerKey,
			duration: dto.duration,
			releaseYear: dto.releaseYear,
			releaseDate: dto.releaseDate
				? this.toTimestamp(new Date(dto.releaseDate).toISOString())
				: undefined,
			ratingAge: dto.ratingAge,
			country: dto.country,
			categoryId: dto.categoryId,
		});

		return MovieMapper.toMovie(movie);
	}

	@ApiOperation({
		summary: "Update movie",
		description:
			"Updates a movie. Only provided fields are changed. Replacing poster/banner deletes the old file. Admin only.",
	})
	@ApiOkResponse({ type: UpdateMovieResponse })
	@ApiNotFoundResponse()
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				poster: { type: "string", format: "binary" },
				banner: { type: "string", format: "binary" },
			},
		},
	})
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: "poster", maxCount: 1 },
			{ name: "banner", maxCount: 1 },
		]),
	)
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	public async update(
		@Param("id") id: string,
		@Body() dto: UpdateMovieRequest,
		@UploadedFiles() files: MovieFiles,
	) {
		const { movie: existing } = await this.client.call("getMovie", { id });

		const posterFile = files?.poster?.[0];
		const bannerFile = files?.banner?.[0];

		let posterKey: string | undefined;
		if (posterFile) {
			await imageFilePipe({ required: true }).transform(posterFile);

			const posterUpload = await this.mediaClient.call("upload", {
				fileName: randomBytes(16).toString("hex"),
				folder: "movies",
				contentType: posterFile.mimetype,
				data: new Uint8Array(posterFile.buffer),
			});
			posterKey = posterUpload.key;
		}

		let bannerKey: string | undefined;
		if (bannerFile) {
			await imageFilePipe({ required: false }).transform(bannerFile);

			const bannerUpload = await this.mediaClient.call("upload", {
				fileName: randomBytes(16).toString("hex"),
				folder: "movies",
				contentType: bannerFile.mimetype,
				data: new Uint8Array(bannerFile.buffer),
			});
			bannerKey = bannerUpload.key;
		}

		const { movie } = await this.client.call("updateMovie", {
			id,
			title: dto.title,
			slug: dto.slug,
			description: dto.description,
			poster: posterKey,
			banner: bannerKey,
			duration: dto.duration,
			releaseYear: dto.releaseYear,
			releaseDate: dto.releaseDate
				? this.toTimestamp(new Date(dto.releaseDate).toISOString())
				: undefined,
			ratingAge: dto.ratingAge,
			country: dto.country,
			categoryId: dto.categoryId,
		});

		if (posterKey && existing?.poster && existing.poster !== posterKey) {
			this.safeDeleteMedia(existing.poster);
		}
		if (bannerKey && existing?.banner && existing.banner !== bannerKey) {
			this.safeDeleteMedia(existing.banner);
		}

		return MovieMapper.toMovie(movie);
	}

	@ApiOperation({
		summary: "Delete movie",
		description:
			"Deletes a movie and its images. Fails if it has upcoming screenings. Admin only.",
	})
	@ApiOkResponse({ type: DeleteMovieResponse })
	@ApiNotFoundResponse()
	@ApiBearerAuth()
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id") id: string) {
		const { movie: existing } = await this.client.call("getMovie", { id });

		const result = await this.client.call("deleteMovie", { id });

		if (existing?.poster) {
			this.safeDeleteMedia(existing.poster);
		}
		if (existing?.banner) {
			this.safeDeleteMedia(existing.banner);
		}

		return result;
	}

	private safeDeleteMedia(key: string): void {
		this.mediaClient.call("delete", { key }).catch(() => {});
	}

	private toTimestamp(iso: string) {
		const ms = new Date(iso).getTime();

		return {
			seconds: Math.floor(ms / 1000),
			nanos: (ms % 1000) * 1_000_000,
		};
	}
}
