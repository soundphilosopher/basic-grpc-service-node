import type { ConnectRouter } from "@connectrpc/connect";

import * as v1 from "./reflection.v1.js";
import * as v1alpha from "./reflection.v1alpha.js";
import { ServiceRegistry } from "./registry";

export function registerReflectionService(router: ConnectRouter): void {
  const serviceRegistry = new ServiceRegistry();

  router.service(
    v1.ServerReflection,
    new v1.ReflectionService(serviceRegistry),
  );
  router.service(
    v1alpha.ServerReflection,
    new v1alpha.ReflectionService(serviceRegistry),
  );
}
