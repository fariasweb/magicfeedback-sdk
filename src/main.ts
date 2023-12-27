import {InitOptions, NativeAnswer} from "./models/types";
import {Form} from "./models/form";
import {Config} from "./models/config";
import {Log} from "./utils/log";
import {sendFeedback} from "./services/request.service";

/**
 *
 * @returns
 */
export default function main() {
    //===============================================
    // Attributes
    //===============================================

    const config: Config = new Config();
    let log: Log;

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
     * @param publicKey
     * @param answers
     * @param profile
     * @returns
     */
    async function send(
        appId: string,
        publicKey: string,
        answers: NativeAnswer[],
        profile?: any
    ) {
        if (!appId) log.err("No appID provided");
        if (!publicKey) log.err("No publicKey provided");
        if (!answers) log.err("No answers provided");
        if (answers.length == 0) log.err("Answers are empty");

        const url = config.get("url");
        const body = {
            integration: appId,
            publicKey: publicKey,
            feedback: {
                answers: answers,
                profile: profile
            },
        }

        try {
            const res = await sendFeedback(url as string, body, log);
            log.log(`sent native feedback`);
            return res;
        } catch (e: any) {
            log.err(`error native feedback`, e);
            return false;
        }
    }

    /**
     *
     * @param appId
     * @param publicKey
     * @returns
     */
    function form(appId: string, publicKey: string) {
        if (!appId) log.err("No appID provided");
        if (!publicKey) log.err("No publicKey provided");
        return new Form(config, appId, publicKey);
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
