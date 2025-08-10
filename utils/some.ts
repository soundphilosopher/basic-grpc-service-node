import {
  SomeServiceDataSchema,
  SomeServiceResponseSchema,
  type SomeServiceData,
  type SomeServiceResponse,
} from "../sdk/basic/service/v1/service_pb.js";
import { setTimeout as sleep } from "node:timers/promises";
import { create } from "@bufbuild/protobuf";

export default async (
  name: string,
  protocol: string,
): Promise<SomeServiceResponse> => {
  await sleep((1 + Math.random() * 2) * 1000);

  const data: SomeServiceData = create(SomeServiceDataSchema, {
    type: "protocol",
    value: protocol,
  });

  return create(SomeServiceResponseSchema, {
    id: crypto.randomUUID(),
    name,
    version: "1.0.0",
    data,
  });
};
