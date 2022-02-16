import { U8 } from "../fields/U8.ts";
import { Text } from "../fields/Text.ts";
import { Buf } from "../mod.ts";

const proto = new Buf({
	id: new U8(),
	username: new Text(16),
});

const chunk = proto.encode({
	id: 72,
	username: "TRGWII",
});

console.log(chunk);
const decoded = proto.decode(chunk);
console.log(decoded);
