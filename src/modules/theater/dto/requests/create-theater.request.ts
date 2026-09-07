import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTheaterRequest {
	@ApiProperty({
		example: "Aurora",
	})
	@IsString()
	@IsNotEmpty()
	public name: string;

	@ApiProperty({
		example: "99 Kyiv St.",
	})
	@IsString()
	@IsNotEmpty()
	public address: string;
}
