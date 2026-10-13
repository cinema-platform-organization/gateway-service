import { ApiProperty } from "@nestjs/swagger";

import { GetTheatersResponse } from "./get-theaters.response";

export class UpdateTheaterResponse {
	@ApiProperty({
		type: GetTheatersResponse,
		description: "The theater after the update",
	})
	public theater: GetTheatersResponse;
}
