import { ApiProperty } from "@nestjs/swagger";

import { GetTheatersResponse } from "./get-theaters.response";

export class CreateTheaterResponse {
	@ApiProperty({ type: GetTheatersResponse })
	public theater: GetTheatersResponse;
}
