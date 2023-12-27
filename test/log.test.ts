import {
    describe,
    expect,
    beforeEach,
    jest,
    it
} from "@jest/globals";
import { Log } from "../src/utils/log";
import { Config } from "../src/models/config";

// Mocking the Config class for testing
jest.mock("../src/models/config");

describe("Log Class Tests", () => {
    let log: Log;
    let mockConfig: Config;

    beforeEach(() => {
        // Reset the mock implementation before each test
        jest.clearAllMocks();

        // Mocking Config instance
        mockConfig = new Config();
        jest.spyOn(mockConfig, "get").mockReturnValue(true);

        // Creating Log instance with mocked Config
        log = new Log(mockConfig);

        // Spying on console.log and console.error
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    it("should log messages when debug is enabled", () => {
        log.log("Test Message");

        // Expect console.log to have been called with the specified message
        expect(console.log).toHaveBeenCalledWith("[MagicFeedback]:", "Test Message");
    });

    it("should not log messages when debug is disabled", () => {
        // Mocking Config to return false for "debug"
        jest.spyOn(mockConfig, "get").mockReturnValue(false);

        log.log("Test Message");

        // Expect console.log not to have been called
        expect(console.log).not.toHaveBeenCalled();
    });

    it("should log error messages", () => {
        log.err("Error Message");

        // Expect console.error to have been called with the specified message
        expect(console.error).toHaveBeenCalledWith("[MagicFeedback]:", "Error Message");
    });
});
