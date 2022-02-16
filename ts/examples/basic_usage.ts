import { U8 } from "../fields/U8.ts";
import { U32 } from "../fields/U32.ts";
import { Text } from "../fields/Text.ts";
import { Union } from "../fields/Union.ts";
import { FixedArray } from "../fields/FixedArray.ts";
import { Buf } from "../mod.ts";

const proto = new Buf({
	id: new U8(),
	username: new Text(16),
	props: new FixedArray(4, new U32()),
	num: new Union(
		new FixedArray(4, new U8()),
		new U32(),
		(val): val is number => !Array.isArray(val),
	),
});

const chunk = proto.encode({
	id: 72,
	username: "TRGWII",
	props: [1, 2, 3, 4],
	num: 38752,
});

console.log(chunk);
const decoded = proto.decode(chunk);
console.log(decoded);

const chunk2 = proto.encode({
	id: 72,
	username: "TRGWII",
	props: [1, 2, 3, 4],
	num: [50, 84, 72, 93],
});

console.log(chunk2);
const decoded2 = proto.decode(chunk2);
console.log(decoded2);
