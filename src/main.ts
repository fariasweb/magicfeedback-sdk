import fetch from "cross-fetch";
import modulePackage from "../package.json";
import { InitOptions, NativeFeedback } from "./types";
import { API_URL } from "./config";

async function request(url: string, body: any) {
  return fetch(url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      "Magicfeedback-Sdk-Version": modulePackage.version,
    },
    body: JSON.stringify(body),
  });
}

export default function main() {
  //===============================================
  // Attributes
  //===============================================

  let url: string = API_URL;
  let debug = false;

  //===============================================
  // Private
  //===============================================

  /**
   *
   * @returns
   */
  function getUrl() {
    return `${url}`;
  }

  /**
   *
   * @param args
   */
  function log(...args: any[]) {
    if (debug) {
      console.log("[MagicFeedback]:", ...args);
    }
  }

  /**
   *
   * @param args
   */
  function err(...args: any[]): never {
    if (debug) {
      console.error("[MagicFeedback]:", ...args);
    }
    throw new Error(...args);
  }

  //===============================================
  // Public
  //===============================================

  /**
   *
   * @param options
   */
  function init(options?: InitOptions) {
    if (options?.url) url = options?.url;
    if (options?.debug) debug = options?.debug;

    log("Initialized Magicfeedback", options);
  }

  /**
   *
   * @param appId
   * @param answers
   * @param profile
   * @returns
   */
  async function send(
    appId: NativeFeedback["appId"],
    answers: NativeFeedback["answers"],
    profile?: NativeFeedback["profile"]
  ) {
    if (!appId) err("No appID provided");
    if (!answers) err("No answers provided");
    if (answers.length == 0) err("Answers are empty");

    const payload: NativeFeedback = {
      appId: appId,
      answers: answers,
    };

    if (profile) payload.profile = profile;

    let res = {}
    try {
      res = await request(`${getUrl()}/feedback/apps`, payload);
      log(`sent native feedback`, res);
    } catch (e: any) {
      err(`error native feedback`, e);
    }
    return res;
  }

  return {
    // lifecycle
    init,
    // requests
    send,
  };
}
