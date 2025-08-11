import { fastify } from "fastify";
import type { FastifyInstance } from "fastify";
import pino, { type Logger as PinoLogger } from "pino";
import type {
  Http2SecureServer,
  Http2ServerRequest,
  Http2ServerResponse,
} from "node:http2";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import routes from "./connect.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const logger = pino({ level: "info" });

async function main() {
  const key = readFileSync(resolve(process.cwd(), "certs/local.key"));
  const cert = readFileSync(resolve(process.cwd(), "certs/local.crt"));

  const server: FastifyInstance<
    Http2SecureServer,
    Http2ServerRequest,
    Http2ServerResponse,
    PinoLogger
  > = fastify({
    loggerInstance: logger,
    http2: true,
    https: { allowHTTP1: true, key, cert },
  });

  await server.register(fastifyConnectPlugin, { routes });

  // ---- graceful shutdown (no process.exit) ----
  let closing = false;
  const onSignal = (signal: NodeJS.Signals) => {
    if (closing) return;
    closing = true;

    server.log.info({ signal }, "received signal, shutting down gracefully…");

    // optional: force timer, but don’t call process.exit unless it actually times out
    const t = setTimeout(() => {
      server.log.error("graceful shutdown timed out — forcing exit 1");
      process.exit(1); // only if truly stuck
    }, 10_000);
    // @ts-ignore
    t.unref?.();

    server.close().then(
      () => {
        clearTimeout(t);
        server.log.info("shutdown complete");
        process.exit(0);
      },
      (err) => {
        clearTimeout(t);
        server.log.error({ err }, "shutdown error");
        process.exitCode = 1; // non-zero only on failure
      },
    );
  };

  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);

  await server.listen({ host: "127.0.0.1", port: 8443 });
  server.log.info({ addresses: server.addresses() }, "server is listening");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
