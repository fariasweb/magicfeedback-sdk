import {
    describe,
    expect,
    beforeEach,
    jest,
    test
} from "@jest/globals";

import fetch from 'cross-fetch';
import {Log} from '../src/utils/log';
import {getQuestions, sendFeedback} from '../src/services/request.service';
import {endpoints} from '../src/services/paths';

jest.mock('cross-fetch');

export const assetsFetchMock = (json: any) => Promise.resolve({
    ok: true,
    status: 200,
    json: async () => json
} as Response);

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('request.service', () => {
    let logMock: Log;

    beforeEach(() => {
        logMock = {
            log: jest.fn(),
            err: jest.fn(),
        } as unknown as Log;
    });

    describe('getQuestions', () => {
        test('should fetch questions successfully', async () => {
            const url = 'http://example.com';
            const appId = 'yourAppId';
            const publicKey = 'yourPublicKey';
            const expectedUrl = `${url}${endpoints.sdk.app(appId, publicKey)}`;
            const expectedResponse = {questions: ['Q1', 'Q2']};

            mockedFetch.mockResolvedValue(await assetsFetchMock(expectedResponse));

            const result = await getQuestions(url, appId, publicKey, logMock);

            expect(mockedFetch).toHaveBeenCalledWith(expectedUrl, {
                method: 'GET',
                headers: expect.objectContaining({'Magicfeedback-Sdk-Version': expect.any(String)}),
            });

            expect(logMock.log).toHaveBeenCalledWith(`Received questions for app ${appId}`, expectedResponse);
            expect(result).toEqual(expectedResponse);
        });

        test('should handle error while fetching questions', async () => {
            const url = 'http://example.com';
            const appId = 'yourAppId';
            const publicKey = 'yourPublicKey';
            const expectedUrl = `${url}${endpoints.sdk.app(appId, publicKey)}`;

            mockedFetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            } as Response);

            const result = await getQuestions(url, appId, publicKey, logMock)

            expect(result).toEqual([]);

            expect(mockedFetch).toHaveBeenCalledWith(expectedUrl, {
                method: 'GET',
                headers: expect.objectContaining({'Magicfeedback-Sdk-Version': expect.any(String)}),
            });

            expect(logMock.err).toHaveBeenCalledWith(
                `Failed to get questions for app ${appId}:`,
                404,
                'Not Found'
            );
        });
    });

    describe('sendFeedback', () => {
        test('should send feedback successfully', async () => {
            const url = 'http://example.com';
            const body = {integration: 'yourAppId', publicKey: 'yourPublicKey', feedback: {answers: ['A1']}};

            mockedFetch.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'Successfully'
            } as Response);

            const result = await sendFeedback(url, body, logMock);

            expect(mockedFetch).toHaveBeenCalledWith(`${url}${endpoints.sdk.feedback}`, {
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'Magicfeedback-Sdk-Version': expect.any(String),
                }),
                body: JSON.stringify(body),
            });

            expect(logMock.log).toHaveBeenCalledWith(`Form ${body.integration} submitted successfully!`);
            expect(result).toEqual(true);
        });

        test('should handle error while sending feedback', async () => {
            const url = 'http://example.com';
            const body = {integration: 'yourAppId', publicKey: 'yourPublicKey', feedback: {answers: ['A1']}};

            mockedFetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            } as Response);

            const result = await sendFeedback(url, body, logMock);

            expect(result).toEqual(false);

            expect(mockedFetch).toHaveBeenCalledWith(`${url}${endpoints.sdk.feedback}`, {
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'Magicfeedback-Sdk-Version': expect.any(String),
                }),
                body: JSON.stringify(body),
            });

            expect(logMock.err).toHaveBeenCalledWith(
                `Failed to submit form ${body.integration}:`,
                500,
                'Internal Server Error'
            );
        });
    });
});
