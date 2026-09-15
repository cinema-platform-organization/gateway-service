import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class GetBookingsRequest {
	@ApiPropertyOptional({ example: 20, default: 20 })
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return raw !== undefined ? Number(raw) : 20;
	})
	public limit: number = 20;

	@ApiPropertyOptional({ example: 1, default: 1 })
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return raw !== undefined ? Number(raw) : 1;
	})
	public page: number = 1;
}
