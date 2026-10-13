import { ApiProperty } from "@nestjs/swagger";

export class DeleteCategoryResponse {
	@ApiProperty({
		description:
			"Always true on success. Failures are returned as an error response " +
			"with a 4xx/5xx status, never as `ok: false`.",
		example: true,
	})
	public ok: boolean;
}
