import { describe, expect, test } from "vitest";
import magicfeedbackSingleton from "../src";

describe("singleton", () => {
  test("an instance is exported", () => {
    expect(magicfeedbackSingleton.init).toBeDefined();
  });
});