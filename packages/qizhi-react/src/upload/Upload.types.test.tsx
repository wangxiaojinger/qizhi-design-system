import { expectTypeOf, test } from "vitest";
import { Upload } from "./Upload";
import type { UploadFile, UploadHandle, UploadProps } from "./Upload.types";

test("exports the approved v1 contracts", () => {
  expectTypeOf(Upload).toBeCallableWith({ multiple: true } as UploadProps);
  expectTypeOf<UploadFile["status"]>()
    .toEqualTypeOf<"init" | "uploading" | "success" | "error">();
  expectTypeOf<UploadHandle["submit"]>().toBeFunction();
});
