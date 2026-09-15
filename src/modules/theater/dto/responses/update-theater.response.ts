import { ApiProperty } from "@nestjs/swagger";

import { GetTheatersResponse } from "./get-theaters.response";

export class UpdateTheaterResponse {
	@ApiProperty({ type: GetTheatersResponse })
	public theater: GetTheatersResponse;
}
