// deno run --no-prompt --allow-env=HOME,DENO_AUTH_TOKENS,XDG_CACHE_HOME,DENO_DIR,USERPROFILE,LOCALAPPDATA --allow-read --allow-write --allow-run=npm,cmd ts/scripts/build_npm.ts

///<reference lib="deno.ns" />
import { build, emptyDir } from "https://deno.land/x/dnt@0.22.0/mod.ts";

await emptyDir("./ts/npm");

await build({
	entryPoints: ["./ts/node.ts"],
	outDir: "./ts/npm",
	shims: {
		// see JS docs for overview and more options
		deno: true,
	},
	package: {
		// package.json properties
		name: "rorybufs",
		version: "0.0.2",
		description: "An efficient binary serialization format.",
		license: "MIT",
		repository: {
			type: "git",
			url: "git+https://github.com/trgwii/RoryBufs.git",
		},
		bugs: {
			url: "https://github.com/trgwii/RoryBufs/issues",
		},
	},
});

// post build steps
Deno.copyFileSync("README.md", "ts/npm/README.md");
