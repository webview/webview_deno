build:
	cargo build

example:
	PLUGIN_URL=target/debug/ deno run \
		-A \
		--unstable \
		--no-check \
		--config examples/ssr/tsconfig.json \
		examples/ssr/main.ts

fmt:
	cargo fmt
	deno fmt --ignore=target/

lint:
	cargo clippy
	deno lint --ignore=target/
