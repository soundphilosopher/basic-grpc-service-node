import type {
  ServiceImpl,
  HandlerContext,
  ConnectRouter,
} from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { BasicService } from "../sdk/basic/v1/basic_pb.js";
import type {
  HelloRequest,
  HelloResponse,
  HelloResponseEvent,
  TalkRequest,
  TalkResponse,
  BackgroundRequest,
  BackgroundResponse,
  BackgroundResponseEvent,
  SomeServiceResponse,
} from "../sdk/basic/service/v1/service_pb.js";
import {
  HelloResponseEventSchema,
  HelloResponseSchema,
  TalkResponseSchema,
  State,
  BackgroundResponseEventSchema,
  BackgroundResponseSchema,
} from "../sdk/basic/service/v1/service_pb.js";
import type { CloudEvent } from "../sdk/io/cloudevents/v1/cloudevents_pb.js";
import {
  CloudEvent_CloudEventAttributeValueSchema,
  CloudEventSchema,
} from "../sdk/io/cloudevents/v1/cloudevents_pb.js";
import type { Any } from "@bufbuild/protobuf/wkt";
import { anyPack, timestampNow } from "@bufbuild/protobuf/wkt";
import { reply as talkReply } from "../utils/talk.js";
import some from "../utils/some.js";
import { setInterval as every } from "node:timers/promises";

class BasicServiceV1 implements ServiceImpl<typeof BasicService> {
  async hello(req: HelloRequest, _ctx: HandlerContext): Promise<HelloResponse> {
    const msg = req.message || "world";

    const event: HelloResponseEvent = create(HelloResponseEventSchema, {
      greeting: `Hello, ${msg}!`,
    });

    const any: Any = anyPack(HelloResponseEventSchema, event);

    const cloudevent: CloudEvent = create(CloudEventSchema, {
      id: crypto.randomUUID(),
      source: "basic.service.v1/Hello",
      specVersion: "1.0",
      type: HelloResponseSchema.typeName,
      attributes: {
        ["time"]: {
          $typeName: CloudEvent_CloudEventAttributeValueSchema.typeName,
          attr: { case: "ceTimestamp", value: timestampNow() },
        },
      },
      data: { case: "protoData", value: any },
    });

    return create(HelloResponseSchema, {
      cloudEvent: cloudevent,
    });
  }

  async *talk(
    req: AsyncIterable<TalkRequest>,
    _ctx: HandlerContext,
  ): AsyncIterable<TalkResponse> {
    for await (const chunk of req) {
      const [text, goodbye] = talkReply(chunk.message ?? "");
      yield create(TalkResponseSchema, {
        answer: text,
      });
      if (goodbye) break;
    }
  }

  async *background(
    req: BackgroundRequest,
    ctx: HandlerContext,
  ): AsyncIterable<BackgroundResponse> {
    const total = Math.max(1, Number(req.processes ?? 1));

    // ---- in-memory "state manager" for this request
    let state = State.PROCESS;
    const startedAt = timestampNow();
    let completedAt = undefined as BackgroundResponseEvent["completedAt"];
    const responses: SomeServiceResponse[] = [];
    let hadError = false;

    let allowed_protocols = [
      "rest",
      "rpc",
      "grpc",
      "graphql",
      "websocket",
      "amqp",
      "mqtt",
      "file",
      "ftp",
      "mail",
    ];
    const plan = [];

    // if caller asked for more than 5, synthesize extras
    for (let i = 0; i < total; i++) {
      let random_protocol_idx = Math.floor(
        Math.random() * allowed_protocols.length,
      );
      plan.push({
        name: `service-${i + 1}`,
        protocol: allowed_protocols[random_protocol_idx],
      });
    }

    // as each task completes, append to responses; when *all* complete, flip state
    const tasks = plan.map(({ name, protocol }) =>
      some(name, protocol)
        .then((res) => void responses.push(res))
        .catch((_err) => {
          hadError = true;
          // optionally push a placeholder/failed response if your schema had one
        }),
    );

    (async () => {
      try {
        await Promise.allSettled(tasks);
      } finally {
        state = hadError ? State.COMPLETE_WITH_ERROR : State.COMPLETE;
        completedAt = timestampNow();
      }
    })();

    // ---- ticker: every 2s emit a snapshot until COMPLETE
    for await (const _ of every(2000, undefined, { signal: ctx.signal })) {
      const evt: BackgroundResponseEvent = create(
        BackgroundResponseEventSchema,
        {
          state,
          startedAt,
          completedAt,
          // snapshot semantics: send everything we have so far
          responses: responses.slice(),
        },
      );

      const packed: Any = anyPack(BackgroundResponseEventSchema, evt);

      const ce: CloudEvent = create(CloudEventSchema, {
        id: crypto.randomUUID(),
        source: "basic.service.v1/Background",
        specVersion: "1.0",
        type: BackgroundResponseEventSchema.typeName,
        attributes: {
          time: create(CloudEvent_CloudEventAttributeValueSchema, {
            attr: { case: "ceTimestamp", value: timestampNow() },
          }),
        },
        data: { case: "protoData", value: packed },
      });

      yield create(BackgroundResponseSchema, { cloudEvent: ce });

      if (state !== State.PROCESS) {
        // final tick already sent; end stream like your Go code's return
        break;
      }
    }
  }
}

export function registerBasicService(router: ConnectRouter): void {
  router.service(BasicService, new BasicServiceV1());
}
