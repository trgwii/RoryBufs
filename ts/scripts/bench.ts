// deno bench --unstable
///<reference lib="deno.unstable" />

import type { Reader } from "../field.d.ts";
import { readAll, type ValueFromSchema } from "../utils.ts";

import { Struct } from "../fields/Struct.ts";
import { F64 } from "../fields/F64.ts";
import { U8 } from "../fields/U8.ts";
import { Optional } from "../fields/Optional.ts";
import { Text } from "../fields/Text.ts";

const User = new Struct({
	id: new F64(),
	is_bot: new U8(),
	first_name: new Text(new U8()),
	last_name: new Optional(new Text(new U8())),
	username: new Optional(new Text(new U8())),
	language_code: new Optional(new Text(new U8())),
	can_join_groups: new Optional(new U8()),
	can_read_all_group_messages: new Optional(new U8()),
	supports_inline_queries: new Optional(new U8()),
});

const data: ValueFromSchema<(typeof User)["schema"]> = {
	id: 42,
	is_bot: 0,
	first_name: "Thomas",
	last_name: "Rory",
	username: "trgwii",
	language_code: "no",
	can_join_groups: null,
	can_read_all_group_messages: null,
	supports_inline_queries: null,
};

let stringified = "";

Deno.bench({
	name: "JSON - stringify",
	fn() {
		stringified = JSON.stringify(data);
	},
});

let parsed = null;

Deno.bench({
	name: "JSON - parse",
	fn() {
		parsed = JSON.parse(stringified);
	},
});

const buf = new Uint8Array(1024);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
let length = 0;

Deno.bench({
	name: "RoryBufs - encode",
	fn() {
		length = User.encode(data, dv);
	},
});

let decoded = null;

Deno.bench({
	name: "RoryBufs - decode",
	fn() {
		decoded = User.decode(dv);
	},
});

class FixedBufferReader implements Reader {
	#offset = 0;
	constructor(public buf: Uint8Array) {}
	read(p: Uint8Array): Promise<number | null> {
		if (this.#offset >= this.buf.byteLength) return Promise.resolve(null);
		const sub = this.buf.subarray(
			this.#offset,
			this.#offset + Math.min(this.buf.byteLength - this.#offset, p.byteLength),
		);
		p.set(sub);
		const bytes = Math.min(p.byteLength, sub.byteLength);
		this.#offset += bytes;
		return Promise.resolve(bytes);
	}
}

let jsonRead = "";

Deno.bench({
	name: "JSON - read",
	async fn() {
		const stringifiedBuf = new TextEncoder().encode(stringified);
		const scratch = new Uint8Array(stringifiedBuf.byteLength);
		const end = await readAll(new FixedBufferReader(stringifiedBuf), scratch);
		jsonRead = JSON.parse(new TextDecoder().decode(scratch.subarray(0, end)));
	},
});

let roryBufsRead = null;

Deno.bench({
	name: "RoryBufs - read",
	async fn() {
		const { bytesRead, value } = await User.read(
			new FixedBufferReader(buf.subarray(0, length)),
		);
		roryBufsRead = value;
	},
});
