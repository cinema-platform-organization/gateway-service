import { timestampToISO } from "@cinema-platform/common";
import type { Timestamp } from "@cinema-platform/contracts/gen/ts/google/protobuf/timestamp";

export class MovieMapper {
	public static toMovie<T extends { releaseDate?: Timestamp | null }>(
		entity?: T | null,
	) {
		if (!entity) {
			return null;
		}

		if (!entity.releaseDate) {
			return {
				...entity,
				releaseDate: null,
			};
		}

		return {
			...entity,
			releaseDate: timestampToISO(entity.releaseDate),
		};
	}
}
