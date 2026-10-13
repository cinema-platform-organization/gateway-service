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
	Query,
	UploadedFiles,
	UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
	ApiBody,
	ApiConsumes,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from "@nestjs/swagger";
import { randomBytes } from "crypto";
import type { Express } from "express";
import "multer";

import { Protected } from "@/shared/decorators";
import { Role } from "@/shared/guards";
import { ApiErrors, type ApiErrorSpec } from "@/shared/swagger";
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

const ID_PARAM = {
	name: "id",
	description: "Movie id",
	format: "uuid",
	example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
};

const INVALID_ID: ApiErrorSpec = {
	status: 400,
	message: "Validation failed (uuid is expected)",
	when: "`id` is not a valid UUID",
};

const MOVIE_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "Movie not found",
	when: "No movie with this id",
};

const CATEGORY_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "Category not found",
	when: "`categoryId` does not belong to an existing category",
};

const DUPLICATE_SLUG: ApiErrorSpec = {
	status: 500,
	message: "Internal server error",
	when: "`slug` is already used by another movie (unique constraint)",
};

const FILE_ERRORS: ApiErrorSpec[] = [
	{
		status: 400,
		message: "File size must not exceed 10MB",
		when: "Poster or banner is larger than 10 MB",
	},
	{
		status: 400,
		message: "Only JPG, PNG, WEBP, GIF image formats are allowed",
		when: "File's MIME type is not image/jpeg, image/png, image/webp or image/gif",
	},
	{
		status: 400,
		message: "Invalid file",
		when: "File could not be validated for another reason",
	},
];

const UPLOAD_FAILED: ApiErrorSpec = {
	status: 500,
	message: "<error text from media storage>",
	when: "Media storage failed to save a file. The message is the storage error from the media service, passed through as is, so it varies",
};

const MOVIE_FIELDS_VALIDATION = [
	"title must be a string",
	"title should not be empty",
	"title must be shorter than or equal to 255 characters",
	"slug must be shorter than or equal to 255 characters",
	"description must be a string",
	"description should not be empty",
	"duration must be an integer number",
	"duration must not be less than 1",
	"releaseYear must be an integer number",
	"releaseDate must be a valid ISO 8601 date string",
	"ratingAge must not be less than 0",
	"ratingAge must not be greater than 21",
	"country must be shorter than or equal to 255 characters",
	"categoryId must be a UUID",
];

const MOVIE_BODY_PROPERTIES = {
	title: {
		type: "string",
		description: "Movie title",
		example: "Interstellar",
		maxLength: 255,
	},
	slug: {
		type: "string",
		description:
			"URL-friendly identifier used in GET /movies/{slug}. Must be unique.",
		example: "interstellar",
		maxLength: 255,
	},
	description: {
		type: "string",
		description: "Plot description",
		example: "A team of explorers travel through a wormhole in space.",
	},
	duration: {
		type: "integer",
		description: "Running time in minutes, at least 1",
		example: 169,
		minimum: 1,
	},
	releaseYear: {
		type: "integer",
		description: "Release year",
		example: 2014,
	},
	releaseDate: {
		type: "string",
		format: "date",
		description:
			"Release date, ISO 8601. A date without time is stored as midnight UTC.",
		example: "2014-11-07",
	},
	ratingAge: {
		type: "integer",
		description: "Minimum viewer age, 0–21 (0 = no restriction)",
		example: 12,
		minimum: 0,
		maximum: 21,
	},
	country: {
		type: "string",
		description: "Country of production",
		example: "USA",
		maxLength: 255,
	},
	categoryId: {
		type: "string",
		format: "uuid",
		description: "Id of an existing category",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
	},
};

@ApiTags("Movies")
@Controller("movies")
export class MovieController {
	public constructor(
		private readonly client: MovieClientGrpc,
		private readonly mediaClient: MediaClientGrpc,
	) {}

	@ApiOperation({
		summary: "List movies",
		description:
			"Returns movies page by page, filtered by `category`. Public, no " +
			"authorization needed.\n\n" +
			"Order: by release date, newest first; movies without a release date " +
			"come first. With `random=true` the order is random and `page` is ignored.\n\n" +
			"Results are cached by the movie service and refreshed whenever a movie " +
			"is created, updated or deleted.",
	})
	@ApiOkResponse({
		type: PaginatedMoviesResponse,
		description: "One page of movies",
	})
	@ApiErrors({
		validation: [
			"category must be a string",
			"random must be a boolean value",
			"limit must be an integer number",
			"limit must not be less than 1",
			"limit must not be greater than 100",
			"page must be an integer number",
			"page must not be less than 1",
		],
	})
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

		// gRPC omits fields with default values: total 0 arrives as undefined
		const total = response.total ?? 0;

		const page = dto.random ? 1 : dto.page;

		return {
			data: movies,
			page,
			limit: dto.limit,
			total,
			totalPages: dto.random ? 1 : Math.ceil(total / dto.limit),
		};
	}

	@ApiOperation({
		summary: "Get movie by id",
		description:
			"Returns one movie with all details by id, for the admin edit form. " +
			"**Admin only.** Public pages use GET /movies/{slug}.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({ type: GetMovieResponse, description: "The movie" })
	@ApiErrors({
		auth: "admin",
		errors: [INVALID_ID, MOVIE_NOT_FOUND],
	})
	@Protected(Role.ADMIN)
	@Get("id/:id")
	@HttpCode(HttpStatus.OK)
	public async getById(@Param("id", ParseUUIDPipe) id: string) {
		const { movie } = await this.client.call("getMovie", { id });

		return MovieMapper.toMovie(movie);
	}

	@ApiOperation({
		summary: "Get movie by slug",
		description:
			"Returns one movie with all details by its slug. Public, no " +
			"authorization needed. Movies without a slug can't be fetched this way.",
	})
	@ApiParam({
		name: "slug",
		description: "Movie slug",
		example: "interstellar",
	})
	@ApiOkResponse({ type: GetMovieResponse, description: "The movie" })
	@ApiErrors({
		errors: [
			{
				status: 404,
				message: "Movie not found",
				when: "No movie with this slug",
			},
		],
	})
	@Get(":slug")
	@HttpCode(HttpStatus.OK)
	public async getBySlug(@Param("slug") slug: string) {
		const { movie } = await this.client.call("getMovie", { slug });

		return MovieMapper.toMovie(movie);
	}

	@ApiOperation({
		summary: "Create movie",
		description:
			"Creates a movie. **Admin only.** Sent as `multipart/form-data`: the " +
			"fields as form fields, the images as files.\n\n" +
			"`poster` is required, `banner` is optional. Each must be a JPG, PNG, " +
			"WEBP or GIF image up to 10 MB. Poster is stored under `posters/`, " +
			"banner under `banners/`.\n\n" +
			"Note: the images are uploaded before the movie is created, so if " +
			"creating fails (unknown category, duplicate slug) the uploaded files " +
			"stay in storage.",
	})
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["title", "description", "duration", "poster"],
			properties: {
				...MOVIE_BODY_PROPERTIES,
				poster: {
					type: "string",
					format: "binary",
					description:
						"Poster image (JPG, PNG, WEBP or GIF, up to 10 MB). Required.",
				},
				banner: {
					type: "string",
					format: "binary",
					description:
						"Wide banner image (JPG, PNG, WEBP or GIF, up to 10 MB)",
				},
			},
		},
	})
	@ApiCreatedResponse({
		type: CreateMovieResponse,
		description: "The created movie",
	})
	@ApiErrors({
		auth: "admin",
		validation: MOVIE_FIELDS_VALIDATION,
		errors: [
			{
				status: 400,
				message: "Poster image is required",
				when: "No `poster` file was sent",
			},
			...FILE_ERRORS,
			CATEGORY_NOT_FOUND,
			DUPLICATE_SLUG,
			UPLOAD_FAILED,
		],
	})
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
			folder: "posters",
			contentType: posterFile.mimetype,
			data: new Uint8Array(posterFile.buffer),
		});

		let bannerKey: string | undefined;
		if (bannerFile) {
			const bannerUpload = await this.mediaClient.call("upload", {
				fileName: randomBytes(16).toString("hex"),
				folder: "banners",
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
			"Changes only the fields and images that are sent; the rest stay as they " +
			"are. At least one field or image is required. **Admin only.** Sent as " +
			"`multipart/form-data`.\n\n" +
			"A new `poster` or `banner` replaces the old one: the new file is uploaded " +
			"(under `posters/` or `banners/`) and the old file is deleted from storage in the " +
			"background. A failed deletion does not fail the request.",
	})
	@ApiParam(ID_PARAM)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				...MOVIE_BODY_PROPERTIES,
				poster: {
					type: "string",
					format: "binary",
					description:
						"New poster image (JPG, PNG, WEBP or GIF, up to 10 MB)",
				},
				banner: {
					type: "string",
					format: "binary",
					description:
						"New banner image (JPG, PNG, WEBP or GIF, up to 10 MB)",
				},
			},
		},
	})
	@ApiOkResponse({
		type: UpdateMovieResponse,
		description: "The movie after the update",
	})
	@ApiErrors({
		auth: "admin",
		validation: MOVIE_FIELDS_VALIDATION,
		errors: [
			INVALID_ID,
			{
				status: 400,
				message: "Nothing to update",
				when: "No fields and no files were sent",
			},
			...FILE_ERRORS,
			MOVIE_NOT_FOUND,
			CATEGORY_NOT_FOUND,
			DUPLICATE_SLUG,
			UPLOAD_FAILED,
		],
	})
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
		@Param("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateMovieRequest,
		@UploadedFiles() files: MovieFiles,
	) {
		const posterFile = files?.poster?.[0];
		const bannerFile = files?.banner?.[0];

		const hasFields = Object.values(dto).some(value => value !== undefined);

		if (!hasFields && !posterFile && !bannerFile) {
			throw new BadRequestException("Nothing to update");
		}

		const { movie: existing } = await this.client.call("getMovie", { id });

		let posterKey: string | undefined;
		if (posterFile) {
			await imageFilePipe({ required: true }).transform(posterFile);

			const posterUpload = await this.mediaClient.call("upload", {
				fileName: randomBytes(16).toString("hex"),
				folder: "posters",
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
				folder: "banners",
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
			"Deletes a movie and its poster and banner. **Admin only.**\n\n" +
			"Not possible while the movie has upcoming screenings — delete or move " +
			"them first. Image files are deleted from storage in the background; " +
			"a failed deletion does not fail the request.",
	})
	@ApiParam(ID_PARAM)
	@ApiOkResponse({ type: DeleteMovieResponse, description: "Movie deleted" })
	@ApiErrors({
		auth: "admin",
		errors: [
			INVALID_ID,
			{
				status: 400,
				message: "Cannot delete movie with upcoming screenings",
				when: "The movie still has screenings in the future",
			},
			MOVIE_NOT_FOUND,
		],
	})
	@Protected(Role.ADMIN)
	@Delete(":id")
	@HttpCode(HttpStatus.OK)
	public async delete(@Param("id", ParseUUIDPipe) id: string) {
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
