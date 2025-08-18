import type {
  ServiceImpl,
  HandlerContext,
  ConnectRouter,
} from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import {
  Health,
  HealthCheckResponse_ServingStatus,
  HealthCheckResponseSchema,
} from "../sdk/grpc/health/v1/health_pb.js";
import type {
  HealthCheckRequest,
  HealthCheckResponse,
} from "../sdk/grpc/health/v1/health_pb.js";
import { ServiceRegistry } from "./registry.js";

class HealthService implements ServiceImpl<typeof Health> {
  constructor(private registry: ServiceRegistry) {}

  async check(
    req: HealthCheckRequest,
    _ctx: HandlerContext,
  ): Promise<HealthCheckResponse> {
    const status = !req.service
      ? HealthCheckResponse_ServingStatus.UNKNOWN
      : this.registry.findService(req.service)
        ? HealthCheckResponse_ServingStatus.SERVING
        : HealthCheckResponse_ServingStatus.SERVICE_UNKNOWN;
    return create(HealthCheckResponseSchema, { status });
  }

  async *watch(
    req: HealthCheckRequest,
    _ctx: HandlerContext,
  ): AsyncIterable<HealthCheckResponse> {
    const status = !req.service
      ? HealthCheckResponse_ServingStatus.UNKNOWN
      : this.registry.findService(req.service)
        ? HealthCheckResponse_ServingStatus.SERVING
        : HealthCheckResponse_ServingStatus.SERVICE_UNKNOWN;
    yield create(HealthCheckResponseSchema, { status });
  }
}

export function registerHealthService(router: ConnectRouter): void {
  router.service(Health, new HealthService(new ServiceRegistry()));
}
