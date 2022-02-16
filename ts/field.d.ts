export interface Field<T> {
	size: number | "variadic";
	encode(value: T, buf: DataView, offset?: number): number;
	decode(buf: DataView, offset?: number): { bytesRead: number; value: T };
}
