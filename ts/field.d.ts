export interface Field<T> {
	size: number;
	encode(value: T, buf: DataView, offset?: number): number;
	decode(buf: DataView, offset?: number): T;
}
