import { ApiProperty } from "@nestjs/swagger";

export class PatchUserResponse {
	@ApiProperty({
		description:
			"Always true on success. Failures are returned as an error response " +
			"with a 4xx/5xx status, never as `ok: false`. The updated profile is " +
			"not returned; fetch it again with GET /users/@me.",
		example: true,
	})
	public ok: boolean;
}
