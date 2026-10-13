import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTheaterRequest {
	@ApiProperty({
		description: "Theater name, shown to users",
		example: "Aurora",
	})
	@IsString()
	@IsNotEmpty()
	public name: string;

	@ApiProperty({
		description: "Street address, shown to users as entered",
		example: "99 Kyiv St.",
	})
	@IsString()
	@IsNotEmpty()
	public address: string;
}
