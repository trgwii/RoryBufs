# RoryBufs

This is an efficient binary serialization format.

## Considerations

This format does not offer versioning, migration, or modifying schema and
reusing existing buffers.

Changing the order or names of fields changes the schema, making existing
buffers incompatible. This is verified by checksum. Internally, buffers are
versioned, and will fail with newer versions of this library.

The intended usecase is for short-lived buffers over a transport protocol, for
example TCP or Websockets.

## TypeScript usage:

```sh
deno run ts/examples/basic_usage.ts
```

([ts/examples/basic_usage.ts](ts/examples/basic_usage.ts))
