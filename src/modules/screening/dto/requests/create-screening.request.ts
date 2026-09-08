import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateScreeningRequest {
	@IsNotEmpty()
	@IsString()
	public movieId: string;

	@IsNotEmpty()
	@IsString()
	public hallId: string;

	@IsNotEmpty()
	@IsDateString()
	public startAt: string;

	@IsNotEmpty()
	@IsDateString()
	public endAt: string;
}
