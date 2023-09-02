import { InitOptions, NativeFeedback } from "./types";
import { Request } from "./request";
import { Form } from "./form";
import { Config } from "./config";
import { Log } from "./log";

/**
 *
 * @returns
 */
export default function main() {
  //===============================================
  // Attributes
  //===============================================

  const config: Config = new Config();
  const request: Request = new Request();
  let log: Log;

  //===============================================
  // Private
  //===============================================
  

  //===============================================
  // Public
  //===============================================

  /**
   *
   * @param options
   */
  function init(options?: InitOptions) {
    if (options?.url) config.set("url", options?.url);
    if (options?.debug) config.set("debug", options?.debug);

    log = new Log(config);

    log.log("Initialized Magicfeedback", config);
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
    if (!appId) log.err("No appID provided");
    if (!answers) log.err("No answers provided");
    if (answers.length == 0) log.err("Answers are empty");

    const payload: NativeFeedback = {
      appId: appId,
      answers: answers,
    };

    if (profile) payload.profile = profile;

    let res = {};
    try {
      res = await request.post(`${config.get("url")}/feedback/apps`, payload);
      log.log(`sent native feedback`, res);
    } catch (e: any) {
      log.err(`error native feedback`, e);
    }
    return res;
  }

  /**
   * 
   * @param appId 
   * @returns 
   */
  function form(appId: string) {
    if (!appId) log.err("No appID provided"); 
    return new Form(config, appId);
  }

  //===============================================
  // Return
  //===============================================

  return {
    // lifecycle
    init,
    // requests
    send,
    form,
  };
}
