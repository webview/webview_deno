build:
	cargo build

example:
	DEV=true deno run \
		-A \
		--unstable \
		--no-check \
		--config examples/ssr/tsconfig.json \
		examples/ssr/ssr.jsx

fmt:
	cargo fmt
	deno fmt --ignore=target/

lint:
	cargo clippy
	deno lint --ignore=target/


