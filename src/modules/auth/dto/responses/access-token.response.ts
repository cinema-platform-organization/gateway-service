import { ApiProperty } from "@nestjs/swagger";

export class AccessTokenResponse {
	@ApiProperty({
		description:
			"Access token for protected endpoints, sent as `Authorization: Bearer <token>`. " +
			"Format: `base64url(userId).base64url(issuedAt).base64url(expiresAt).hmacSha256Hex`. " +
			"When it expires, protected endpoints answer 401 `Expired`; get a new one " +
			"with POST /auth/refresh. The refresh token is never returned in the body, " +
			"only as an httpOnly cookie.",
		example:
			"YTFiMmMzZDQ.MTc2MDM1NjAwMA.MTc2MDM1NjkwMA.9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
	})
	public accessToken: string;
}
