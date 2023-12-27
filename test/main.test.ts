import {
    describe,
    expect,
    beforeEach,
    jest,
    test
} from "@jest/globals";

import main from "../src/main";
import {NativeAnswer} from "../src/models/types";


jest.mock("../src/models/config");
jest.mock("../src/utils/log");
jest.mock("../src/services/request.service");

describe("Main Function Tests", () => {
    let mainInstance: ReturnType<typeof main>;
    let requestService: any;

    beforeEach(() => {
        mainInstance = main();
        requestService = require("../src/services/request.service");

        const options = {url: 'example.com', debug: true};
        mainInstance.init(options);
    });

    test('init function', () => {

        // You can add assertions based on your application logic
        expect(mainInstance).toBeDefined();
    });

    test('send function', async () => {
        const appId = 'yourAppId';
        const publicKey = 'yourPublicKey';
        const answers: NativeAnswer[] = [{key: 'Q1', value: ['A1']}];

        const sendFeedbackMock = jest.spyOn(requestService, "sendFeedback");

        sendFeedbackMock.mockResolvedValueOnce(true);

        const result = await mainInstance.send(appId, publicKey, answers);
        // You can add assertions based on your application logic
        expect(result).toBe(true);
    });

    test('form function', () => {
        const appId = 'yourAppId';
        const publicKey = 'yourPublicKey';
        const formInstance = mainInstance.form(appId, publicKey);
        // You can add assertions based on your application logic
        expect(formInstance).toBeDefined();
        expect(formInstance).toBeInstanceOf(Object);
        expect(formInstance)
    });
});
