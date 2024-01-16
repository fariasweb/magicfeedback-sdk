import {generateFormOptions, NativeAnswer, NativeQuestion} from "./types";

import {Config} from "./config";
import {Log} from "../utils/log";
import {getFollowUpQuestion, getForm, getQuestions, sendFeedback} from "../services/request.service";
import {FormData} from "./formData";
import {renderActions, renderQuestions, renderSuccess} from "../services/questions.service";

export class Form {
    /**
     * Attributes
     */
    private config: Config;
    private readonly log: Log;

    private readonly appId: string;
    private readonly publicKey: string;
    private readonly url: string;

    private id: string;
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
        this.id = '';
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

        const questionContainer = document.createElement("div");
        questionContainer.classList.add("magicfeedback-questions");
        questionContainer.id = "magicfeedback-questions-" + appId;

        // Process questions and create in the form
        this.elementQuestions = renderQuestions(appQuestions);

        switch (this.formData?.identity) {
            case 'MAGICSURVEY':
                questionContainer.appendChild(this.elementQuestions[0]);
                break;
            default:
                this.elementQuestions.forEach((element) =>
                    questionContainer.appendChild(element));
                break;
        }

        form.appendChild(questionContainer);

        // Add the form to the specified container
        container.appendChild(form);

        // Submit button
        if (options.addButton) {
            // Create a container for the buttons
            const actionContainer = renderActions(this.formData?.identity, () => {
                if (this.progress === 0) return;
                form.removeChild(this.elementQuestions[this.progress]);
                form.appendChild(this.elementQuestions[this.progress - 1]);
                this.progress--;
            });

            form.appendChild(actionContainer);
        }


        // Submit event
        form.addEventListener("submit", async (event) => {
            console.log("Submit event", event);
            event.preventDefault();

            try {
                // BEFORE
                if (options.beforeSubmitEvent) {
                    await options.beforeSubmitEvent({
                        loading: true,
                        progress: this.progress,
                        total: this.total
                    });
                }

                // SEND
                const response = await this.send(
                    this.formData?.identity !== 'MAGICSURVEY'
                );

                if (!response) throw new Error("An error occurred while submitting the form.");

                this.id = response;
                await this.processNextQuestion(container, questionContainer);

                // AFTER
                if (options.afterSubmitEvent) {
                    await options.afterSubmitEvent({
                        response,
                        loading: false,
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

                if (options.afterSubmitEvent) {
                    await options.afterSubmitEvent({
                        loading: false,
                        progress: this.progress,
                        total: this.questions.length,
                        error
                    });
                }

                // You can perform error handling logic here if needed
                return error;
            }
        });

        form.addEventListener("magicfeedback-back", async (event) => {
            console.log("Back event", event);
            event.preventDefault();

            try {
                if (this.progress === 0) return;
                form.removeChild(this.elementQuestions[this.progress]);
                form.appendChild(this.elementQuestions[this.progress - 1]);
                this.progress--;
                return;
            } catch (error) {
                // Handle error in beforeBackEvent, send(), or afterBackEvent
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
    public async send(completed: boolean = false): Promise<string> {
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
                },
                completed,
            }

            // Make the AJAX POST request
            return await sendFeedback(
                url as string,
                this.id ? {...body, sessionId: this.id} : body,
                this.log
            );

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

    /**
     * Call follow up question
     * @param question
     * @private
     */

    private async callFollowUpQuestion(question: NativeQuestion): Promise<NativeQuestion | null> {
        try {
            if (!question.followup) throw new Error("No follow up question");

            // Get the survey answers from the answer() function
            const surveyAnswers = this.answer();

            if (surveyAnswers.length === 0) throw new Error("No answers provided");

            // Define the URL and request payload
            const url = this.config.get("url");
            const body = {
                answer: surveyAnswers[0].value[0],
                publicKey: this.publicKey,
                sessionId: this.id,
                question
            }

            return await getFollowUpQuestion(
                url as string,
                body,
                this.log,
            );
        } catch (error) {
            // Handle network or request error
            this.log.err(
                `An error occurred while submitting the form ${this.appId}:`,
                error
            );
            // You can perform error handling logic here if needed
            throw error;
            return null;
        }
    }

    /**
     * Process next question
     * @param container
     * @param form
     * @private
     */

    private async processNextQuestion(container: HTMLElement, form: HTMLElement) {
        switch (this.formData?.identity) {
            case 'MAGICFORM':
                this.total = this.questions.length;
                this.progress = this.questions.length;
                break;
            case 'MAGICSURVEY':
                if (this.questions[this.progress].followup) {
                    const followUp = await this.callFollowUpQuestion(this.questions[this.progress]);
                    if (followUp) {
                        const question = renderQuestions([followUp])[0];
                        console.log(question);
                        form.removeChild(this.elementQuestions[this.progress]);
                        form.appendChild(question);
                    } else {
                        this.renderNext(form, container);
                    }
                } else {
                    this.renderNext(form, container);
                }
                break;
            default:
                // Remove the form
                container.removeChild(form);

                // Show the success message
                const successMessage = renderSuccess("Thank you for your feedback!");
                container.appendChild(successMessage);

                break;
        }

    }

    /**
     * Render next question
     * @param form
     * @param container
     * @private
     */
    private renderNext(form: HTMLElement, container: HTMLElement) {
        this.progress++;
        if (this.progress < this.total) {
            form.removeChild(this.elementQuestions[this.progress - 1]);
            form.appendChild(this.elementQuestions[this.progress]);
        } else {
            // Remove the form
            container.removeChild(form);

            // Show the success message - Remove in the future
            const successMessage = renderSuccess("Thank you for your feedback!");
            container.appendChild(successMessage);
        }
    }
}
