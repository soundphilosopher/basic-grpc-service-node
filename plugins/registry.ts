import { readFileSync } from "node:fs";
import { fromBinary, createFileRegistry, toBinary } from "@bufbuild/protobuf";
import type { DescService, FileRegistry } from "@bufbuild/protobuf";
import {
  FileDescriptorProtoSchema,
  FileDescriptorSetSchema,
} from "@bufbuild/protobuf/wkt";

export class ServiceRegistry {
  private registry: FileRegistry;

  constructor() {
    const descriptor_data = readFileSync("./sdk/descriptor.bin");
    const fileDescriptorSet = fromBinary(
      FileDescriptorSetSchema,
      descriptor_data,
    );
    this.registry = createFileRegistry(fileDescriptorSet);
  }

  findService(name: string): DescService | undefined {
    return this.registry.getService(name);
  }

  getRegistry(): FileRegistry {
    return this.registry;
  }

  getFileByFilename(filename: string): Uint8Array | undefined {
    const file = this.registry.getFile(filename);
    if (file) {
      return toBinary(FileDescriptorProtoSchema, file.proto);
    }
  }

  getFileContainingSymbol(typeName: string): Uint8Array | undefined {
    const desc = this.registry.get(typeName);
    const file = desc?.file;
    if (file) {
      return toBinary(FileDescriptorProtoSchema, file.proto);
    }
  }

  getFileContainingExtension(
    containingType: string,
    extensionNumber: number,
  ): Uint8Array | undefined {
    const msg = this.registry.getMessage(containingType);
    if (!msg) {
      return;
    }

    const desc = this.registry.getExtensionFor(msg, extensionNumber);
    if (desc) {
      const file = desc.file;
      if (file) {
        return toBinary(FileDescriptorProtoSchema, file.proto);
      }
    }
  }

  getAllExtensionNumbersOfType(value: string): number[] | undefined {
    const extensions = [...this.registry.files]
      .map((file) => file.extensions)
      .flat();
    const numbers = extensions
      .filter((e) => e.typeName === value)
      .map((e) => e.number);
    return numbers;
  }

  listServices(): string[] {
    const services = [...this.registry.files]
      .map((file) => file.services)
      .flat();
    const serviceNames = services.map((service) => service.typeName);
    return serviceNames;
  }
}
