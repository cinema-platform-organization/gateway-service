import { ApiProperty } from "@nestjs/swagger";

import { GetScreeningResponse } from "../responses";

export class UpdateScreeningResponse {
	@ApiProperty({
		type: GetScreeningResponse,
		description:
			"The screening after the update, with movie, hall and theater",
	})
	public screening: GetScreeningResponse;
}
