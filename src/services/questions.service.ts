import {NativeQuestion} from "../models/types";

export function renderQuestions(appQuestions: NativeQuestion[]): HTMLElement[] {
    if (!appQuestions) throw new Error("[MagicFeedback] No questions provided");
    const questions: HTMLElement[] = [];

    appQuestions.forEach((question) => {
        const {
            id,
            title,
            type,
            ref,
            require,
            //external_id,
            value,
            defaultValue,
        } = question;

        let element: HTMLElement;
        let elementTypeClass: string;

        let elementContainer: HTMLElement = document.createElement("div");
        elementContainer.classList.add("magicfeedback-div");

        switch (type) {
            case "TEXT":
                // Create a text input field
                element = document.createElement("input");
                (element as HTMLInputElement).type = "text";
                (element as HTMLInputElement).placeholder = "Write your answer here...";
                elementTypeClass = "magicfeedback-text";
                break;
            case "LONGTEXT":
                // Create a textarea element for TEXT and LONGTEXT types
                element = document.createElement("textarea");
                (element as HTMLTextAreaElement).rows = 3; // Set the number of rows based on the type
                (element as HTMLInputElement).placeholder = "Write your answer here...";
                elementTypeClass = "magicfeedback-longtext";
                break;
            case "NUMBER":
                // Create an input element with type "number" for NUMBER type
                element = document.createElement("input");
                (element as HTMLInputElement).type = "number";
                (element as HTMLInputElement).placeholder = "Insert a number here";
                elementTypeClass = "magicfeedback-number";

                if (value.length) {
                    value.sort((a: string, b: string) => Number(a) - Number(b));
                    (element as HTMLInputElement).max = value[value.length - 1];
                    (element as HTMLInputElement).min = value[0];
                    (element as HTMLInputElement).value = value[0];
                }
                break;
            case "RADIO":
            case "MULTIPLECHOICE":
            case 'RATING':
                element = document.createElement("div");

                if (type === 'RATING') {
                    elementTypeClass = 'magicfeedback-rating';

                    const ratingContainer = document.createElement('div');
                    ratingContainer.classList.add('magicfeedback-rating-container');

                    for (let i = 1; i <= 10; i++) {
                        const ratingOption = document.createElement('div');
                        ratingOption.classList.add('magicfeedback-rating-option');

                        const containerLabel = document.createElement('label');
                        containerLabel.htmlFor = `rating-${ref}-${i}`;
                        containerLabel.classList.add('magicfeedback-rating-option-label-container');

                        const ratingLabel = document.createElement('label');
                        ratingLabel.htmlFor = `rating-${ref}-${i}`;
                        ratingLabel.textContent = i.toString();

                        const ratingImage = document.createElement('img');
                        ratingImage.src = `https://magicfeedback-c6458-dev.web.app/assets/${i}.svg`;
                        ratingImage.alt = `face-${ref}-${i}`;
                        // ratingImage is used to set the form value
                        // ... add the code to set the value here

                        ratingImage.className = `rating-image${i}`;

                        const input = document.createElement("input");
                        input.id = `rating-${ref}-${i}`;
                        input.type = "radio";
                        input.name = ref;
                        input.value = i.toString();
                        input.required = require;
                        input.classList.add(elementTypeClass);
                        input.classList.add("magicfeedback-input");

                        containerLabel.appendChild(input);
                        containerLabel.appendChild(ratingImage);
                        containerLabel.appendChild(ratingLabel);

                        ratingOption.appendChild(containerLabel);
                        ratingContainer.appendChild(ratingOption);
                    }

                    element.appendChild(ratingContainer);

                } else {
                    elementTypeClass =
                        `magicfeedback-${type === "RADIO" ? "radio" : "checkbox"}`;

                    value.forEach((option,index) => {
                        const container = document.createElement("div");
                        container.classList.add(
                            `magicfeedback-${type === "RADIO" ? "radio" : "checkbox"}-container`
                        );
                        const label = document.createElement("label");
                        const input = document.createElement("input");
                        input.id = `rating-${ref}-${index}`;
                        input.type = type === "RADIO" ? "radio" : "checkbox";
                        input.name = ref;
                        input.value = option;
                        input.required = require;
                        input.classList.add(elementTypeClass);
                        input.classList.add("magicfeedback-input");

                        if (option === defaultValue) {
                            input.checked = true;
                        }

                        label.textContent = option;
                        label.htmlFor = `rating-${ref}-${index}`;

                        container.appendChild(input);
                        container.appendChild(label);
                        element.appendChild(container);
                    });
                }
                break;
            case "SELECT":
                // Create a select element for RADIO and MULTIPLECHOICE types
                element = document.createElement("select");
                elementTypeClass = "magicfeedback-select";
                (element as HTMLInputElement).placeholder = "Select an option";

                value.forEach((optionValue) => {
                    // Create an option element for each value in the question's value array
                    const option = document.createElement("option");
                    option.value = optionValue;
                    option.text = optionValue;
                    (element as HTMLSelectElement).appendChild(option);
                });
                break;
            case "DATE":
                // Create an input element with type "date" for DATE type
                element = document.createElement("input");
                (element as HTMLInputElement).type = "date";
                elementTypeClass = "magicfeedback-date";
                break;
            case "BOOLEAN":
                // Create an input element with type "checkbox" for BOOLEAN type
                element = document.createElement("input");
                (element as HTMLInputElement).type = "checkbox";
                elementTypeClass = "magicfeedback-boolean";
                break;
            case "EMAIL":
                // Create an input element with type "email" for EMAIL type
                element = document.createElement("input");
                (element as HTMLInputElement).type = "email";
                (element as HTMLInputElement).placeholder = "you@example.com";
                elementTypeClass = "magicfeedback-email";
                break;
            case "PASSWORD":
                // Create an input element with type "password" for PASSWORD type
                element = document.createElement("input");
                (element as HTMLInputElement).type = "password";
                (element as HTMLInputElement).placeholder = "Write your password here";
                elementTypeClass = "magicfeedback-password";
                break;
            case "CONTACT":
                // Create an input element with type "tel" for CONTACT type
                element = document.createElement("input");
                (element as HTMLInputElement).type = "tel";
                elementTypeClass = "magicfeedback-contact";
                break;
            default:
                return; // Skip unknown types
        }


        element.id = `magicfeedback-${id}`;
        element.setAttribute("name", ref);

        if (defaultValue !== undefined) {
            (element as HTMLInputElement).value = defaultValue;
        }

        // Add the label and input element to the form
        const label = document.createElement("label");
        label.setAttribute("for", `magicfeedback-${id}`);
        label.textContent = title;
        label.classList.add("magicfeedback-label");
        elementContainer.appendChild(label);
        element.classList.add(elementTypeClass);

        if (type != "RADIO" && type != "MULTIPLECHOICE") {
            element.classList.add("magicfeedback-input");
            (element as HTMLInputElement).required = require;
        }

        elementContainer.appendChild(element);
        questions.push(elementContainer);
    });

    return questions;
}

export function renderActions(identity: string = '', backAction: () => void): HTMLElement {

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("magicfeedback-action-container");

    // Create a submit button if specified in options
    const submitButton = document.createElement("button");
    submitButton.id = "magicfeedback-submit";
    submitButton.type = "submit";
    submitButton.classList.add("magicfeedback-submit");
    submitButton.textContent = identity === 'MAGICSURVEY' ? "Next" : "Submit"

    // Create a back button
    const backButton = document.createElement("button");
    backButton.id = "magicfeedback-back";
    backButton.type = "button";
    backButton.classList.add("magicfeedback-back");
    backButton.textContent = "Back";
    backButton.addEventListener("click", backAction);

    if (identity === 'MAGICSURVEY') {
        actionContainer.appendChild(backButton);
    }

    actionContainer.appendChild(submitButton);

    return actionContainer;
}

export function renderError(error: string): HTMLElement {
    const errorElement = document.createElement("div");
    errorElement.classList.add("magicfeedback-error");
    errorElement.textContent = error;
    return errorElement;
}

export function renderSuccess(success: string): HTMLElement {
    const successElement = document.createElement("div");
    successElement.classList.add("magicfeedback-success");
    successElement.textContent = success;
    return successElement;
}
