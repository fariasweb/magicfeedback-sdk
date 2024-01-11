import {generateFormOptions, NativeAnswer, NativeQuestion} from "./types";

import {Config} from "./config";
import {Log} from "../utils/log";
import {getForm, getQuestions, sendFeedback} from "../services/request.service";
import {FormData} from "./formData";
import {renderActions, renderQuestions} from "../services/questions.service";

export class Form {
    /**
     * Attributes
     */
    private config: Config;
    private readonly log: Log;

    private readonly appId: string;
    private readonly publicKey: string;
    private readonly url: string;

    private formData: FormData | null;
    private questions: NativeQuestion[];
    private elementQuestions: HTMLElement[];
    public progress: number;
    public total: number;


    /**
     *
     * @param config
     * @param appId
     * @param publicKey
     */
    constructor(config: Config, appId: string, publicKey: string) {
        // Config
        this.config = config;
        this.log = new Log(config);

        // Attributes
        this.appId = appId;
        this.publicKey = publicKey;
        this.url = config.get("url") as string;

        // Data
        this.formData = null;
        this.questions = [];
        this.elementQuestions = [];
        this.progress = 0;
        this.total = 0;
    }

    /**
     * Generate
     * TODO: Check if is inside of a <form>
     * @param selector
     * @param options
     */
    public async generate(selector: string, options: generateFormOptions = {}) {
        this.formData = await getForm(this.url, this.appId, this.publicKey, this.log)

        if (this.formData === undefined || !this.formData) {
            this.log.err(`No form for app ${this.appId}`);
            return;
        }

        this.log.log("Generating form for app", this.appId);

        // Request question from the app
        getQuestions(this.url, this.appId, this.publicKey, this.log).then((appQuestions: NativeQuestion[]) => {
            if (appQuestions === undefined || !appQuestions) {
                this.log.err(`No questions for app ${this.appId}`);
                return;
            }

            this.questions = appQuestions;
            this.total = appQuestions.length;
            // Create the form from the JSON
            this.generateForm(this.appId, appQuestions, selector, options);
        });
    }

    /**
     * Create
     * @param appId
     * @param appQuestions
     * @param selector
     * @param options
     *
     * TODO: Add option to generate in <form> or in other <tag>
     */
    private generateForm(
        appId: string,
        appQuestions: NativeQuestion[],
        selector: string,
        options: generateFormOptions = {}
    ) {
        // Select the container
        const container: HTMLElement | null = document.getElementById(selector);
        if (!container) {
            this.log.err(`Element with ID '${selector}' not found.`);
            return;
        }
        container.classList.add("magicfeedback-container");

        // Create the form
        const form = document.createElement("form");
        form.classList.add("magicfeedback-form");
        form.id = "magicfeedback-" + appId;

        // If the form is identity like survey

        // Process questions and create in the form
        this.elementQuestions = renderQuestions(appQuestions);

        switch (this.formData?.identity) {
            case 'MAGICSURVEY':
                form.appendChild(this.elementQuestions[0]);
                break;
            default:
                this.elementQuestions.forEach((element) =>
                    form.appendChild(element));
                break;
        }

        // Submit button
        if (options.addButton) {
            // Create a container for the buttons
            const actionContainer = renderActions(this.formData?.identity);

            form.appendChild(actionContainer);
        }

        // Add the form to the specified container
        container.appendChild(form);

        // Submit event
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                // BEFORE
                if (options.beforeSubmitEvent) {
                    await options.beforeSubmitEvent();
                }

                let response;

                // SEND
                if (this.formData?.identity === 'MAGICSURVEY') {
                    // response = await this.send();
                    response = true;

                    if (response) {
                        this.progress++;

                        if (this.progress < this.total) {
                            form.removeChild(this.elementQuestions[this.progress - 1]);
                            form.appendChild(this.elementQuestions[this.progress]);
                        } else {
                            this.progress = 100;
                        }

                    }
                } else {
                    response = await this.send();
                    if (response) this.progress = 100;
                }


                // AFTER
                if (options.afterSubmitEvent) {
                    await options.afterSubmitEvent({
                        response,
                        progress: this.progress,
                        total: this.questions.length,
                    });
                }

                return response;
            } catch (error) {
                // Handle error in beforeSubmitEvent, send(), or afterSubmitEvent
                this.log.err(
                    `An error occurred while submitting the form ${this.appId}:`,
                    error
                );
                // You can perform error handling logic here if needed
                return error;
            }
        });
    }

    /**
     * Answer
     * @param appId
     * @returns
     * TODO: Required
     */
    public answer(): NativeAnswer[] {
        const form: HTMLElement | null = document.getElementById(
            "magicfeedback-" + this.appId
        );

        if (!form) {
            this.log.err(`Form "${form}" not found.`);
            return [];
        }

        const surveyAnswers: NativeAnswer[] = [];
        let hasError = false; // Flag to track if an error has occurred

        const inputs = form.querySelectorAll(".magicfeedback-input");

        inputs.forEach((input) => {
            const inputType = (input as HTMLInputElement).type;
            //const required = (input as HTMLInputElement).required;

            const ans: NativeAnswer = {
                key: (input as HTMLInputElement).name,
                value: [],
            };

            const value = (input as HTMLInputElement).value;
            if (inputType === "radio" || inputType === "checkbox") {
                if ((input as HTMLInputElement).checked) {
                    ans.value.push(value);
                    surveyAnswers.push(ans);
                }
            } else {
                ans.value.push(value);
                surveyAnswers.push(ans);
            }
        });

        if (hasError) {
            return []; // Stop the process if there's an error
        }

        return surveyAnswers;
    }

    /**
     * Send
     * @returns
     */
    public async send() {
        try {
            // Get the survey answers from the answer() function
            const surveyAnswers = this.answer();

            if (surveyAnswers.length === 0) throw new Error("No answers provided");

            // Define the URL and request payload
            const url = this.config.get("url");
            const body = {
                integration: this.appId,
                publicKey: this.publicKey,
                feedback: {
                    answers: surveyAnswers,
                }
            }

            // Make the AJAX POST request
            return await sendFeedback(url as string, body, this.log);

        } catch (error) {
            // Handle network or request error
            this.log.err(
                `An error occurred while submitting the form ${this.appId}:`,
                error
            );
            // You can perform error handling logic here if needed
            throw error;
        }
    }
}
