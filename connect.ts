import type { ConnectRouter } from "@connectrpc/connect";
import { registerHealthService } from "./plugins/health.js";
import { registerReflectionService } from "./plugins/reflection.js";
import { registerBasicService } from "./plugins/basic.js";

export default (router: ConnectRouter) => {
  // add reflection API to router
  registerReflectionService(router);
  // add health service
  registerHealthService(router);

  // register basic service
  registerBasicService(router);
};
