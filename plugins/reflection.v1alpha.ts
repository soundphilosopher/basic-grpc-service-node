import type { ServiceImpl } from "@connectrpc/connect";
import { Code } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import {
  ErrorResponseSchema,
  ExtensionNumberResponseSchema,
  FileDescriptorResponseSchema,
  ServerReflectionResponseSchema,
  ListServiceResponseSchema,
} from "../sdk/grpc/reflection/v1alpha/reflection_pb";
import type {
  ServerReflectionRequest,
  ServerReflectionResponse,
  ServerReflection,
} from "../sdk/grpc/reflection/v1alpha/reflection_pb";
import type { ServiceRegistry } from "./registry";

export { ServerReflection } from "../sdk/grpc/reflection/v1alpha/reflection_pb";

export class ReflectionService implements ServiceImpl<typeof ServerReflection> {
  constructor(private registry: ServiceRegistry) {}

  async *serverReflectionInfo(
    reqs: AsyncIterable<ServerReflectionRequest>,
  ): AsyncGenerator<ServerReflectionResponse> {
    for await (const req of reqs) {
      const response = create(ServerReflectionResponseSchema, {
        validHost: req.host,
        originalRequest: req,
      });

      switch (req.messageRequest.case) {
        case "fileByFilename": {
          const file = this.registry.getFileByFilename(
            req.messageRequest.value,
          );
          response.messageResponse = file
            ? {
                case: "fileDescriptorResponse",
                value: create(FileDescriptorResponseSchema, {
                  fileDescriptorProto: [file],
                }),
              }
            : {
                case: "errorResponse",
                value: create(ErrorResponseSchema, {
                  errorCode: Code.NotFound,
                  errorMessage: `File not found: ${req.messageRequest.value}`,
                }),
              };
          break;
        }
        case "fileContainingSymbol": {
          const file = this.registry.getFileContainingSymbol(
            req.messageRequest.value,
          );
          response.messageResponse = file
            ? {
                case: "fileDescriptorResponse",
                value: create(FileDescriptorResponseSchema, {
                  fileDescriptorProto: [file],
                }),
              }
            : {
                case: "errorResponse",
                value: create(ErrorResponseSchema, {
                  errorCode: Code.NotFound,
                  errorMessage: `File not found: ${req.messageRequest.value}`,
                }),
              };
          break;
        }
        case "fileContainingExtension": {
          const file = this.registry.getFileContainingExtension(
            req.messageRequest.value.containingType,
            req.messageRequest.value.extensionNumber,
          );
          response.messageResponse = file
            ? {
                case: "fileDescriptorResponse",
                value: create(FileDescriptorResponseSchema, {
                  fileDescriptorProto: [file],
                }),
              }
            : {
                case: "errorResponse",
                value: create(ErrorResponseSchema, {
                  errorCode: Code.NotFound,
                  errorMessage: `File not found: ${req.messageRequest.value}`,
                }),
              };
          break;
        }
        case "allExtensionNumbersOfType": {
          const numbers = this.registry.getAllExtensionNumbersOfType(
            req.messageRequest.value,
          );
          response.messageResponse = {
            case: "allExtensionNumbersResponse",
            value: create(ExtensionNumberResponseSchema, {
              extensionNumber: numbers,
            }),
          };
          break;
        }
        case "listServices": {
          const services = this.registry.listServices();
          response.messageResponse = {
            case: "listServicesResponse",
            value: create(ListServiceResponseSchema, {
              service: services.map((name) => ({ name })),
            }),
          };
          break;
        }
        case undefined: {
          break;
        }
        default: {
          throw new Error(
            `Unknown request: ${JSON.stringify(req.messageRequest satisfies never, null, 2)}`,
          );
        }
      }

      yield response;
    }
  }
}
