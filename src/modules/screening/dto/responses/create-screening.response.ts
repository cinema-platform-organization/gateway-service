import { ApiProperty } from "@nestjs/swagger";

export class CreateScreeningResponse {
	@ApiProperty({
		description:
			"Always true on success. The created screening is not returned; find it " +
			"with GET /screenings. Failures are returned as an error response.",
		example: true,
	})
	public ok: boolean;
}
