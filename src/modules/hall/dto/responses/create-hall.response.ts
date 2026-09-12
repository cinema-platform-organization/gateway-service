import { ApiProperty } from "@nestjs/swagger";

import { GetHallResponse } from "./get-hall.response";

export class CreateHallResponse {
	@ApiProperty({ type: GetHallResponse })
	public hall: GetHallResponse;
}
