# RoryBufs

This is an efficient binary serialization format.

## Considerations

This format does not offer versioning, migration, or modifying schema and
reusing existing buffers.

Changing the order or field names changes the schema, making existing buffers
incompatible. This is verified by checksum. Internally, buffers are versioned,
and will fail with newer versions of this library.

## TypeScript usage:

```sh
deno run ts/examples/basic_usage.ts
```
