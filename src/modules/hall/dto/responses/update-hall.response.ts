import { ApiProperty } from "@nestjs/swagger";

import { GetHallResponse } from "./get-hall.response";

export class UpdateHallResponse {
	@ApiProperty({
		type: GetHallResponse,
		description: "The hall after the update",
	})
	public hall: GetHallResponse;
}
