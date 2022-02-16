import { U8 } from "../fields/U8.ts";
import { U32 } from "../fields/U32.ts";
import { Text } from "../fields/Text.ts";
import { Union } from "../fields/Union.ts";
import { FixedArray } from "../fields/FixedArray.ts";
import { ArrayList } from "../fields/ArrayList.ts";
import { Buf } from "../mod.ts";

const proto = new Buf({
	id: new U8(),
	username: new Text(),
	props: new FixedArray(4, new U32()),
	num: new Union(
		new U32(),
		new FixedArray(4, new U8()),
		(val): val is number[] => Array.isArray(val),
	),
	meme: new ArrayList(new U8()),
	fart: new ArrayList(new Text()),
	boi: new Union(
		new U8(),
		new Text(),
		(val): val is string => typeof val === "string",
	),
});

const chunk = proto.encode({
	id: 72,
	username: "TRGWII",
	props: [1, 2, 3, 4],
	num: 38752,
	meme: [5, 4, 3, 2, 1, 0, 8],
	fart: ["penis", "cock", "balls"],
	boi: 4,
}, 1024);

console.log(chunk);
const decoded = proto.decode(chunk);
console.log(JSON.stringify(decoded).length, chunk.byteLength, decoded);

const chunk2 = proto.encode({
	id: 72,
	username: "TRGWII",
	props: [1, 2, 3, 4],
	num: [50, 84, 72, 93],
	meme: [5, 4, 3, 2, 1, 0, 8],
	fart: ["penis", "cock", "balls"],
	boi: "LONG STRING",
}, 1024);

console.log(chunk2);
const decoded2 = proto.decode(chunk2);
console.log(JSON.stringify(decoded2).length, chunk2.byteLength, decoded2);
