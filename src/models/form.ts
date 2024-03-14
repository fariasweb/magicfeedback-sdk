import {generateFormOptions, NativeAnswer, NativeFeedback, NativeQuestion} from "./types";

import {Config} from "./config";
import {Log} from "../utils/log";
import {getFollowUpQuestion, getForm, sendFeedback, validateEmail} from "../services/request.service";
import {FormData} from "./formData";
import {renderActions, renderQuestions, renderSuccess} from "../services/questions.service";

export class Form {
    /**
     * Attributes
     */
        // SDK Config
    private config: Config;
    private readonly log: Log;

    // Form options
    private formOptionsConfig: generateFormOptions;
    private selector: string;

    // Integration attributes
    private readonly appId: string;
    private readonly publicKey: string;
    private readonly url: string;

    // Form completed data
    private formData: FormData | null;
    private id: string;
    private readonly feedback: NativeFeedback;

    // Questions
    public questions: NativeQuestion[];
    private questionInProcess: NativeQuestion | null;

    // History of questions diccionary
    private readonly history: Record<number, { object: NativeQuestion, element: HTMLElement }[]>;
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
        // SDK Config
        this.config = config;
        this.log = new Log(config);

        // Form options
        this.formOptionsConfig = {
            addButton: true,
            sendButtonText: "Send",
            backButtonText: "Back",
            nextButtonText: "Next",
            addSuccessScreen: true,
            getMetaData: true,
            questionFormat: "standard",
        };

        this.selector = "";

        // Attributes
        this.appId = appId;
        this.publicKey = publicKey;
        this.url = config.get("url") as string;

        // Form completed data
        this.id = "";
        this.formData = null;
        this.feedback = {
            text: "",
            answers: [],
            profile: [],
            metrics: [],
            metadata: [],
        };

        // Questions and history
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
    public async generate(selector: string, options: generateFormOptions) {

        // Check options, and set default values if this is not defined

        try {
            // Set the options
            this.formOptionsConfig = {...this.formOptionsConfig, ...options};

            this.selector = selector;

            // Check if the form is in the localstorage and the time is less than 1 day
            const localForm = localStorage.getItem(`magicfeedback-${this.appId}`);

            if (localForm && new Date(JSON.parse(localForm).savedAt) < new Date(new Date().getTime() + 60 * 60 * 24 * 1000)) {
                this.formData = JSON.parse(localForm);
                getForm(this.url, this.appId, this.publicKey, this.log).then((form: FormData | null) => {
                    if (form?.updatedAt && this.formData?.savedAt && form?.updatedAt > this.formData?.savedAt) {
                        console.log("Form updated");
                        this.formData = form;
                        this.formData.savedAt = new Date();
                        if (this.formData.questions) {
                            this.questions = this.formData.questions;
                            this.total = this.questions.length;
                        }
                        localStorage.setItem(`magicfeedback-${this.appId}`, JSON.stringify(this.formData));
                        // Create the form from the JSON
                        this.generateForm();
                    }
                });
            } else {
                // Send the data to manage loadings and progress
                this.formData = await getForm(this.url, this.appId, this.publicKey, this.log)
            }

            if (this.formData === undefined || !this.formData) throw new Error(`No form for app ${this.appId}`);

            if (!this.formData.savedAt) {
                // Save formData in the localstorage to use it in the future
                this.formData.savedAt = new Date();
                localStorage.setItem(`magicfeedback-${this.appId}`, JSON.stringify(this.formData));
            }

            this.questions = this.formData.questions;

            if (this.questions === undefined || !this.questions) throw new Error(`No questions for app ${this.appId}`);

            this.total = this.questions.length;

            // Send the data to manage loadings and progress
            if (this.formOptionsConfig.onLoadedEvent) {
                await this.formOptionsConfig.onLoadedEvent({
                    loading: false,
                    progress: this.progress,
                    total: this.total,
                    formData: this.formData,
                });
            }

            if (this.formOptionsConfig.getMetaData) this.getMetaData();

            // Create the form from the JSON
            this.generateForm();
        } catch (e) {
            this.log.err(e);

            if (this.formOptionsConfig.onLoadedEvent) {
                await this.formOptionsConfig.onLoadedEvent({
                    loading: false,
                    error: e,
                });
            }

            return;
        }
    }

    /**
     * Create
     *
     * TODO: Add option to generate in <form> or in other <tag>
     */
    private generateForm() {
        try {
            // Order questions by position
            this.questions.sort((a, b) => a.position - b.position);
            // Select and prepare the container
            const container: HTMLElement | null = document.getElementById(this.selector);
            if (!container) throw new Error(`Element with ID '${this.selector}' not found.`);
            container.classList.add("magicfeedback-container");
            container.id = "magicfeedback-container-" + this.appId;
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
            this.elementQuestions = renderQuestions(this.questions, this.formOptionsConfig.questionFormat);

            switch (this.formData?.identity) {
                case 'MAGICSURVEY':
                    this.elementQuestions.forEach((element, index) =>
                        this.history[index] = [{object: this.questions[index], element}]
                    );
                    this.questionInProcess = this.history[0][0].object;
                    questionContainer.appendChild(this.history[0][0].element);
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
            if (this.formOptionsConfig.addButton) {
                // Create a container for the buttons
                const actionContainer = renderActions(
                    this.formData?.identity,
                    () => this.back(),
                    this.formOptionsConfig.sendButtonText,
                    this.formOptionsConfig.backButtonText,
                    this.formOptionsConfig.nextButtonText,
                );

                form.appendChild(actionContainer);
            }

            // Submit event
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                this.send()
            });
        } catch (e) {
            this.log.err(e);

            if (this.formOptionsConfig.onLoadedEvent) {
                this.formOptionsConfig.onLoadedEvent({
                    loading: false,
                    error: e,
                });
            }
            return;
        }
    }

    /**
     * Get the metadata from the URL, navigators and others
     * @private
     */

    private getMetaData() {
        // Add the navigator url and params from the URL to the metadata
        this.feedback.metadata.push({key: "navigator-url", value: [window.location.href]});
        this.feedback.metadata.push({key: "navigator-origin", value: [window.location.origin]});
        this.feedback.metadata.push({key: "navigator-pathname", value: [window.location.pathname]});
        this.feedback.metadata.push({key: "navigator-search", value: [window.location.search]});

        // Add the navigator metadata
        this.feedback.metadata.push({key: "navigator-user", value: [navigator.userAgent]});
        this.feedback.metadata.push({key: "navigator-language", value: [navigator.language]});
        this.feedback.metadata.push({key: "navigator-platform", value: [navigator.platform]});
        this.feedback.metadata.push({key: "navigator-appVersion", value: [navigator.appVersion]});
        this.feedback.metadata.push({key: "navigator-appName", value: [navigator.appName]});
        this.feedback.metadata.push({key: "navigator-product", value: [navigator.product]});

        // Add the size of the screen
        this.feedback.metadata.push({key: "screen-width", value: [window.screen.width.toString()]});
        this.feedback.metadata.push({key: "screen-height", value: [window.screen.height.toString()]});

    }

    /**
     * Send current answer and verify if its necessary continue with a new question
     * @pubilc
     * @param profile
     * @param metrics
     * @param metadata
     */
    public async send(
        metadata?: NativeAnswer[],
        metrics?: NativeAnswer[],
        profile?: NativeAnswer[]
    ) {
        const container = document.getElementById("magicfeedback-container-" + this.appId) as HTMLElement;
        const questionContainer = document.getElementById("magicfeedback-questions-" + this.appId) as HTMLElement;

        try {
            if (profile) this.feedback.profile = [...this.feedback.profile, ...profile];
            if (metrics) this.feedback.metrics = [...this.feedback.metrics, ...metrics];
            if (metadata) this.feedback.metadata = [...this.feedback.metadata, ...metadata];

            // BEFORE
            if (this.formOptionsConfig.beforeSubmitEvent) {
                await this.formOptionsConfig.beforeSubmitEvent({
                    loading: true,
                    progress: this.progress,
                    total: this.total
                });
            }

            // SEND
            const response = await this.pushAnswers(
                this.formData?.identity !== 'MAGICSURVEY'
            );

            if (response) {
                this.id = response;
                await this.processNextQuestion(container, questionContainer);
            }

            // AFTER
            if (this.formOptionsConfig.afterSubmitEvent) {
                await this.formOptionsConfig.afterSubmitEvent({
                    response,
                    loading: false,
                    progress: this.progress,
                    total: this.total,
                    error: response ? null : new Error("No response")
                });
            }
        } catch (error) {
            // Handle error in beforeSubmitEvent, send(), or afterSubmitEvent
            this.log.err(
                `An error occurred while submitting the form ${this.appId}:`,
                error
            );

            if (this.formOptionsConfig.afterSubmitEvent) {
                await this.formOptionsConfig.afterSubmitEvent({
                    loading: false,
                    progress: this.progress,
                    total: this.total,
                    error
                });
            }
        }
    }


    /**
     * Update feedback.answers with the answers of the form in a JSON format
     * @returns
     * TODO: Required
     */
    public answer() {
        const form: HTMLElement | null = document.getElementById(
            "magicfeedback-" + this.appId
        );

        if (!form) {
            this.log.err(`Form "${form}" not found.`);
            this.feedback.answers = [];
            return;
        }

        const surveyAnswers: NativeAnswer[] = [];
        let hasError = false; // Flag to track if an error has occurred

        const inputs = form.querySelectorAll(".magicfeedback-input");

        inputs.forEach((input) => {
            const inputType = (input as HTMLInputElement).type;
            const elementTypeClass = (input as HTMLInputElement).classList[0];

            const ans: NativeAnswer = {
                key: (input as HTMLInputElement).name,
                value: [],
            };

            const value = elementTypeClass === 'magicfeedback-boolean' ?
                (input as HTMLInputElement).checked.toString() :
                (input as HTMLInputElement).value;

            if (!ans.key || ans.key === "") {
                return;
            } else {
                switch (inputType) {
                    case "radio":
                    case "checkbox":
                        if (
                            elementTypeClass === "magicfeedback-boolean" ||
                            (input as HTMLInputElement).checked
                        ) {
                            ans.value.push(value);

                            // check if the answer is already in the array and merge the values
                            const index = surveyAnswers.findIndex(
                                (a) => a.key === ans.key
                            );
                            if (index !== -1) {
                                surveyAnswers[index].value = [
                                    ...surveyAnswers[index].value,
                                    ...ans.value,
                                ];
                            } else {
                                surveyAnswers.push(ans);
                            }
                        }
                        break;
                    case "email":
                        if (!validateEmail(value)) {
                            this.log.err("Invalid email");
                            hasError = true;
                        } else {
                            this.feedback.profile.push({
                                key: "email",
                                value: [value],
                            });

                            ans.value.push(value);
                            surveyAnswers.push(ans);
                        }
                        break;
                    default:
                        if (value !== "") {
                            ans.value.push(value);
                            surveyAnswers.push(ans);
                        }
                }
            }
        });

        if (hasError) {
            this.feedback.answers = []; // Stop the process if there's an error
            return;
        }

        this.feedback.answers = surveyAnswers;
    }

    /**
     * Send
     * @param completed
     * @returns
     */
    private async pushAnswers(completed: boolean = false): Promise<string> {
        try {
            // Get the survey answers from the answer() function
            this.answer();
            if (this.formData?.identity === "MAGICFORM") {
                if (this.feedback.answers.length === 0) throw new Error("No answers provided");
                this.questions.forEach((question) => {
                    if (question.require && !this.feedback.answers.find((a) => a.key === question.ref)) {
                        throw new Error(`No answer provided for question ${question.title}`);
                    }
                });
            } else {
                if (
                    !completed &&
                    this.questionInProcess?.require &&
                    this.feedback.answers.length === 0
                ) throw new Error("No answers provided");
            }

            // Define the URL and request payload
            const url = this.config.get("url");
            const body = {
                integration: this.appId,
                publicKey: this.publicKey,
                feedback: this.feedback,
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
            return '';
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
            if (this.feedback.answers.length === 0) throw new Error("No answers provided");

            // Define the URL and request payload
            const url = this.config.get("url");

            const body = {
                answer: this.feedback.answers[0].value[0],
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
            case 'MAGICSURVEY':
                if (!this.questionInProcess?.followup) {
                    this.renderNextQuestion(form, container);
                } else {
                    const followUp = await this.callFollowUpQuestion(this.questionInProcess);
                    if (followUp) {
                        // Update the question in process
                        this.questionInProcess = followUp;

                        // Add the follow up question to the history
                        const question = renderQuestions([followUp], this.formOptionsConfig?.questionFormat)[0];
                        this.history[this.progress].push({object: followUp, element: question});

                        form.removeChild(form.childNodes[0]);
                        form.appendChild(question);
                    } else {
                        this.renderNextQuestion(form, container);
                    }
                }
                break;
            default:
                this.total = this.questions.length;
                this.progress = this.questions.length;

                if (this.formOptionsConfig.addSuccessScreen) {
                    // Remove the form
                    if (container.childNodes.length > 0) container.removeChild(container.childNodes[0]);

                    // Show the success message
                    const successMessage = renderSuccess(
                        this.formOptionsConfig.successMessage ||
                        "Thank you for your feedback!"
                    );

                    container.appendChild(successMessage);
                }

                break;
        }

    }

    /**
     * Render next question
     * @param form
     * @param container
     * @private
     */
    private renderNextQuestion(form: HTMLElement, container: HTMLElement) {
        this.progress++;
        if (this.progress < this.total) {
            this.questionInProcess = this.history[this.progress][0].object;
            form.removeChild(form.childNodes[0]);
            form.appendChild(this.history[this.progress][0].element);
        } else {
            if (this.formOptionsConfig.addSuccessScreen) {
                // Remove the form
                if (container.childNodes.length > 0) container.removeChild(container.childNodes[0]);

                // Show the success message
                const successMessage = renderSuccess(
                    this.formOptionsConfig.successMessage ||
                    "Thank you for your feedback!"
                );

                container.appendChild(successMessage);
            }

            this.pushAnswers(true);
        }
    }

    /**
     * Render back question
     * @private
     */
    public back() {
        if (this.progress === 0) return;

        const form = document.getElementById("magicfeedback-questions-" + this.appId) as HTMLElement;
        form.removeChild(form.childNodes[0]);

        if (this.history[this.progress].length > 1) {
            // Delete the last question in the history array and load the previous one
            this.history[this.progress].pop();
        } else {
            // Use the previous question in the history array
            this.progress--;
        }

        // Get the last question in the history array
        const question = this.history[this.progress][this.history[this.progress].length - 1];
        // Update the question in process
        this.questionInProcess = question.object;
        form.appendChild(question.element);
    }
}
