import {
	BadRequestException,
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
} from "@nestjs/common";

export function imageFilePipe(options?: { required?: boolean }) {
	return new ParseFilePipe({
		fileIsRequired: options?.required ?? true,
		validators: [
			new MaxFileSizeValidator({
				maxSize: 10 * 1024 * 1024,
				message: "File size must not exceed 10MB",
			}),
			new FileTypeValidator({
				fileType: /(jpg|jpeg|png|webp|gif)$/i,
			}),
		],
		exceptionFactory(error) {
			if (error.includes("File is too large")) {
				throw new BadRequestException("File size must not exceed 10MB");
			}
			if (error.includes("Invalid file type")) {
				throw new BadRequestException(
					"Only JPG, PNG, WEBP, GIF image formats are allowed",
				);
			}

			throw new BadRequestException("Invalid file");
		},
	});
}
