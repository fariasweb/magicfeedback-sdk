import { describe, test, expect } from '@jest/globals';
import magicfeedbackSingleton from "../src";

describe("singleton", () => {
  test("an instance is exported", () => {
    expect(magicfeedbackSingleton.init).toBeDefined();
  });
});