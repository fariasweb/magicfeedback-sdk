import fetch from "cross-fetch";
import modulePackage from "../../package.json";
import {Log} from "../utils/log";
import {endpoints} from "./paths";
import {NativeQuestion} from "../models/types";

const header = {
    Accept: "application/json",
    "Magicfeedback-Sdk-Version": modulePackage.version,
}

// @ts-ignore
const serializedParams = (params: any) => Object.entries(params).map(
    ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
).join("&");

export async function getQuestions(url: string, appId: string, publicKey: string, log: Log): Promise<NativeQuestion[]> {
    try {
        const response = await fetch(url + endpoints.sdk.app(appId, publicKey), {
            method: "GET",
            headers: header
        });

        if (response.ok) {
            // Handle success response
            const json = await response.json();
            log.log(`Received questions for app ${appId}`, json);
            return json;
        } else {
            // Handle error response
            log.err(
                `Failed to get questions for app ${appId}:`,
                response.status,
                response.statusText
            );
            throw new Error("[MagicFeedback] Bad response from server");
        }
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function sendFeedback(url: string, body: any, log: Log): Promise<boolean> {
    try {
        const response = await fetch(url + endpoints.sdk.feedback, {
            method: "POST",
            headers: {...{"Content-Type": "application/json"}, ...header},
            body: JSON.stringify(body),
        });

        if (response.ok) {
            // Handle success response
            log.log(`Form ${body.integration} submitted successfully!`);
            // You can perform additional actions here if needed
            return true;
        } else {
            // Handle error response
            log.err(
                `Failed to submit form ${body.integration}:`,
                response.status,
                response.statusText
            );
            throw new Error(response.statusText);
        }
    } catch (e) {
        console.error(e);
        return false;
    }
}
