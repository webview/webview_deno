build:
	cargo build

example:
	DEV=true deno run -A --unstable examples/user_agent.ts

fmt:
	cargo fmt
	deno fmt --ignore=target/

lint:
	cargo clippy
	deno lint --ignore=target/


