import { ApiProperty } from "@nestjs/swagger";

import { GetScreeningResponse } from "../responses";

export class UpdateScreeningResponse {
	@ApiProperty({ type: GetScreeningResponse })
	public screening: GetScreeningResponse;
}
