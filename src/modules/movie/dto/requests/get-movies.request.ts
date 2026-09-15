import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsBoolean,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class GetMoviesRequest {
	@ApiPropertyOptional({
		example: "now",
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) => String(value).trim())
	public category?: string;

	@ApiPropertyOptional({
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }: { value: unknown }) => {
		if (value === "true") {
			return true;
		}
		if (value === "false") {
			return false;
		}

		return value;
	})
	public random?: boolean;

	@ApiPropertyOptional({
		example: 12,
		default: 10,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }) => (value !== undefined ? Number(value) : 10))
	public limit: number = 10;

	@ApiPropertyOptional({
		example: 1,
		default: 1,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }) => (value !== undefined ? Number(value) : 1))
	public page: number = 1;
}
