import { ApiProperty } from "@nestjs/swagger";

export class DeleteMovieResponse {
	@ApiProperty({ example: true })
	public ok: boolean;
}
