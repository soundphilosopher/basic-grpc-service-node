import { readFileSync } from "node:fs";
import { fromBinary, createFileRegistry } from "@bufbuild/protobuf";
import type { DescService, FileRegistry } from "@bufbuild/protobuf";
import { FileDescriptorSetSchema } from "@bufbuild/protobuf/wkt";

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
}
