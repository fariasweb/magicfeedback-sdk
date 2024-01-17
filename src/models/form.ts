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

    // Form completed data
    private formData: FormData | null;

    // Questions
    public questions: NativeQuestion[];
    private questionInProcess: NativeQuestion | null;

    // History of questions diccionary
    private history: Record<number, HTMLElement[]>;
    private elementQuestions: HTMLElement[];

    // Count variables
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
        this.questionInProcess = null;
        this.history = {};

        // Count variables
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
        try {
            this.formData = await getForm(this.url, this.appId, this.publicKey, this.log)

            if (this.formData === undefined || !this.formData) throw new Error(`No form for app ${this.appId}`);

            this.log.log("Generating form for app", this.appId);

            this.questions = await getQuestions(this.url, this.appId, this.publicKey, this.log);

            if (this.questions === undefined || !this.questions) throw new Error(`No questions for app ${this.appId}`);

            this.total = this.questions.length;

            // Send the data to manage loadings and progress
            if (options.onLoadedEvent) {
                await options.onLoadedEvent({
                    loading: false,
                    progress: this.progress,
                    total: this.total,
                });
            }

            // Create the form from the JSON
            this.generateForm(selector, options);
        } catch (e) {
            this.log.err(e);
            return;
        }
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
        selector: string,
        options: generateFormOptions = {}
    ) {
        try {
            // Select and prepare the container
            const container: HTMLElement | null = document.getElementById(selector);
            if (!container) throw new Error(`Element with ID '${selector}' not found.`);
            container.classList.add("magicfeedback-container");
            container.innerHTML = "";

            // Create the form
            const form = document.createElement("form");
            form.classList.add("magicfeedback-form");
            form.id = "magicfeedback-" + this.appId;

            // Create the questions container
            const questionContainer = document.createElement("div");
            questionContainer.classList.add("magicfeedback-questions");
            questionContainer.id = "magicfeedback-questions-" + this.appId;

            // Process questions and create in the form
            this.elementQuestions = renderQuestions(this.questions);

            switch (this.formData?.identity) {
                case 'MAGICSURVEY':
                    this.elementQuestions.forEach((element, index) =>
                        this.history[index] = [element]
                    );
                    this.questionInProcess = this.questions[0];
                    questionContainer.appendChild(this.history[0][0]);
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
                const actionContainer = renderActions(
                    this.formData?.identity,
                    () => this.renderBack(questionContainer)
                );

                form.appendChild(actionContainer);
            }


            // Submit event
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                this.sendProcess(options, container, questionContainer)
            });
        } catch (e) {
            this.log.err(e);
            return;
        }
    }


    /**
     *
     * @private
     */
    private async sendProcess(
        options: generateFormOptions,
        container: HTMLElement,
        questionContainer: HTMLElement
    ) {
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

            if (this.formData) this.formData.id = response;

            await this.processNextQuestion(container, questionContainer);

            // AFTER
            if (options.afterSubmitEvent) {
                await options.afterSubmitEvent({
                    response,
                    loading: false,
                    progress: this.progress,
                    total: this.total,
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
                    total: this.total,
                    error
                });
            }

            // You can perform error handling logic here if needed
            return error;
        }
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

            if (surveyAnswers.length === 0 && !completed) throw new Error("No answers provided");

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
                this.formData?.id ? {...body, sessionId: this.formData?.id} : body,
                this.log
            );

        } catch
            (error) {
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

    private async callFollowUpQuestion(question: NativeQuestion | null): Promise<NativeQuestion | null> {
        if (!question?.followup) return null;
        try {
            // Get the survey answers from the answer() function
            const surveyAnswers = this.answer();

            if (surveyAnswers.length === 0) throw new Error("No answers provided");

            // Define the URL and request payload
            const url = this.config.get("url");
            const body = {
                answer: surveyAnswers[0].value[0],
                publicKey: this.publicKey,
                sessionId: this.formData?.id,
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
                if (!this.questionInProcess?.followup) {
                    this.renderNext(form, container);
                } else {
                    const followUp = await this.callFollowUpQuestion(this.questionInProcess);
                    if (followUp) {
                        this.questionInProcess = followUp;
                        if (!this.questions[this.progress].followupQuestion) {
                            this.questions[this.progress].followupQuestion = [followUp];
                        } else {
                            this.questions[this.progress].followupQuestion.push(followUp);
                        }
                        const question = renderQuestions([followUp])[0];
                        this.history[this.progress].push(question);

                        form.removeChild(form.childNodes[0]);
                        form.appendChild(question);
                    } else {
                        this.renderNext(form, container);
                    }
                }
                break;
            default:
                // Remove the form
                container.removeChild(container.childNodes[0]);

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
            this.questionInProcess = this.questions[this.progress];
            form.removeChild(form.childNodes[0]);
            form.appendChild(this.history[this.progress][0]);
        } else {
            // Remove the form
            container.removeChild(container.childNodes[0]);

            // Show the success message - Remove in the future
            const successMessage = renderSuccess("Thank you for your feedback!");
            container.appendChild(successMessage);
            this.send(true)
        }
    }

    /**
     * Render back question
     * @param form
     * @private
     */
    private renderBack(form: HTMLElement) {
        if (this.progress === 0) return;
        form.removeChild(form.childNodes[0]);
        if (this.history[this.progress].length > 1) {
            // Delete the last question in the history array and load the previous one
            this.history[this.progress].pop();
            this.questions[this.progress].followupQuestion.pop()
            this.questionInProcess = this.questions[this.progress].followupQuestion[this.questions[this.progress].followupQuestion.length - 1];
            form.appendChild(this.history[this.progress][this.history[this.progress].length - 1]);
        } else {
            // Use the previous question in the history array
            this.progress--;
            this.questionInProcess = this.questions[this.progress];
            form.appendChild(this.history[this.progress][0]);
        }
    }
}
