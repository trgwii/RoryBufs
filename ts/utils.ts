export function assert(
	ok: boolean,
	message: string,
	Err: ErrorConstructor = Error,
) {
	if (!ok) throw new Err(message);
}

export function assertWithin<T extends number | bigint>(
	value: T,
	min: T,
	max: T,
) {
	assert(
		value > min && value < max,
		String(value) + " is out of bounds",
		RangeError,
	);
}
