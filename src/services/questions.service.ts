import {FEEDBACKAPPANSWERTYPE, NativeQuestion} from "../models/types";
import {placeholder} from "./placeholder";

// Function to get the query params
const params = (a: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(a);
}

export function renderQuestions(
    appQuestions: NativeQuestion[],
    format: string = "standard",
    language: string = "en",
    send?: () => void
): HTMLElement[] {
    if (!appQuestions) throw new Error("[MagicFeedback] No questions provided");
    const questions: HTMLElement[] = [];

    appQuestions.forEach((question) => {

        if (question?.questionType?.conf?.length > 0) {
            let elementContainer: HTMLElement = document.createElement("div");
            elementContainer.classList.add("magicfeedback-div");
            question.questionType.conf.forEach((conf: any) => {
                conf.ref = question.ref
                if (question.assets[conf.id]) {
                    conf.assets = {
                        placeholder: question.assets[conf.id],
                    }
                }
            });
            const elements = renderQuestions(question.questionType.conf, format, language, send);
            elements.forEach((element) => {
                elementContainer.appendChild(element);
            });
            questions.push(elementContainer);
        } else {
            // Create a container for each question
            const elementContainer = renderContainer(question, format, language, send);
            questions.push(elementContainer);
        }
    });

    return questions;
}

function parseTitle(title: string, lang: string): string {
    return typeof title === "object" ? (title[lang] || title['en']) : title;
}

// Make a function to return a array with yes and no in every language
function getBooleanOptions(lang: string): string[] {
    switch (lang) {
        case "es":
            return ['Sí', 'No'];
        case "fr":
            return ['Oui', 'Non'];
        case "de":
            return ['Ja', 'Nein'];
        case "it":
            return ['Sì', 'No'];
        case "pt":
            return ['Sim', 'Não'];
        case "nl":
            return ['Ja', 'Nee'];
        case "pl":
            return ['Tak', 'Nie'];
        case "ru":
            return ['Да', 'Нет'];
        case "ja":
            return ['はい', 'いいえ'];
        case "zh":
            return ['是', '不'];
        case "ko":
            return ['예', '아니'];
        case 'da':
            return ['Ja', 'Nej'];
        case 'fi':
            return ['Kyllä', 'Ei'];
        case 'sv':
            return ['Ja', 'Nej'];
        case 'no':
            return ['Ja', 'Nei'];
        case 'ar':
            return ['نعم', 'لا'];
        case 'bn':
            return ['হ্যাঁ', 'না'];
        default:
            return ['Yes', 'No'];

    }
}

function renderContainer(
    question: NativeQuestion,
    format: string,
    language: string,
    send?: () => void
): HTMLElement {
    let {
        id,
        title,
        type,
        ref,
        require,
        //external_id,
        value,
        defaultValue,
        // questionType,
        assets
    } = question;

    let element: HTMLElement;
    let elementTypeClass: string;

    let elementContainer: HTMLElement = document.createElement("div");
    elementContainer.classList.add("magicfeedback-div");

    const placeholderText = format === 'slim' ? parseTitle(title, language) : assets?.placeholder

    // Look if exist the value in a query param with the ref like a key
    const urlParamValue = params(id);

    switch (type) {
        case FEEDBACKAPPANSWERTYPE.TEXT:
            // Create a text input field
            element = document.createElement("input");
            (element as HTMLInputElement).type = "text";
            (element as HTMLInputElement).placeholder = placeholderText || placeholder.answer(language || 'en')

            ;
            elementTypeClass = "magicfeedback-text";
            break;
        case FEEDBACKAPPANSWERTYPE.LONGTEXT:
            // Create a textarea element for TEXT and LONGTEXT types
            element = document.createElement("textarea");
            (element as HTMLTextAreaElement).rows = 3; // Set the number of rows based on the type
            (element as HTMLTextAreaElement).maxLength = 300; // Set the max length of the text area
            (element as HTMLInputElement).placeholder = placeholderText || placeholder.answer(language || 'en');
            elementTypeClass = "magicfeedback-longtext";
            break;
        case FEEDBACKAPPANSWERTYPE.NUMBER:
            // Create an input element with type "number" for NUMBER type
            element = document.createElement("input");
            (element as HTMLInputElement).type = "number";
            (element as HTMLInputElement).placeholder = format === 'slim' ? parseTitle(title, language) : placeholder.number(language || 'en');
            elementTypeClass = "magicfeedback-number";

            if (value.length) {
                value.sort((a: string, b: string) => Number(a) - Number(b));
                (element as HTMLInputElement).max = value[value.length - 1];
                (element as HTMLInputElement).min = value[0];
                (element as HTMLInputElement).value = value[0];
            }
            break;
        case FEEDBACKAPPANSWERTYPE.RADIO:
        case FEEDBACKAPPANSWERTYPE.MULTIPLECHOICE:
            element = document.createElement("div");

            elementTypeClass =
                `magicfeedback-${(type === "MULTIPLECHOICE" ? "checkbox" : "radio")}`;

            if (assets.extraOption) value.push(assets.extraOptionText);

            value.forEach((option, index) => {
                const container = document.createElement("div");
                container.classList.add(
                    `magicfeedback-${type === "MULTIPLECHOICE" ? "checkbox" : "radio"}-container`
                );
                const label = document.createElement("label");
                const input = document.createElement("input");
                input.id = `rating-${ref}-${index}`;
                input.type = type === "MULTIPLECHOICE" ? "checkbox" : "radio";
                input.name = ref;
                input.value = option;
                input.classList.add(elementTypeClass);
                input.classList.add("magicfeedback-input");

                if (option === defaultValue || option === urlParamValue) {
                    input.checked = true;
                }

                label.textContent = option;
                label.htmlFor = `rating-${ref}-${index}`;

                if (assets.extraOption && option === assets.extraOptionText) {
                    input.addEventListener("change", (event) => {
                        const extraOption = document.getElementById(`extra-option-${ref}`);
                        if (extraOption) {
                            if ((event.target as HTMLInputElement).checked) {
                                extraOption.style.display = "block";
                            } else {
                                extraOption.style.display = "none";
                            }
                        }
                    });
                }

                container.appendChild(input);
                container.appendChild(label);
                element.appendChild(container);

                // If is assets.extraOptionText add a input text after the label to add a custom value available only if is selected
                if (assets.extraOption && option === assets.extraOptionText) {
                    const inputText = document.createElement("input");
                    inputText.type = "text";
                    inputText.placeholder = "Custom value";
                    inputText.classList.add("magicfeedback-extra-option");
                    inputText.classList.add("magicfeedback-input");
                    inputText.id = `extra-option-${ref}`;
                    inputText.name = `extra-option-${ref}`;
                    inputText.style.display = "none";

                    element.appendChild(inputText);
                }
            });
            break;
        case FEEDBACKAPPANSWERTYPE.BOOLEAN:
            // Create an input element with type "checkbox" for BOOLEAN type with option yes or no
            element = document.createElement("div");
            elementTypeClass = 'magicfeedback-radio';

            const booleanContainer = document.createElement('div');
            booleanContainer.classList.add('magicfeedback-boolean-container');
            booleanContainer.style.display = "flex";
            booleanContainer.style.flexDirection = "row";
            booleanContainer.style.justifyContent = "space-between";
            booleanContainer.style.width = "70%";
            booleanContainer.style.margin = "auto";

            const booleanOptions = assets.addIcon ? ['👍', '👎'] : getBooleanOptions(language);

            // Create a input button element for each value in the question's value array
            booleanOptions.forEach((option, index) => {
                const container = document.createElement("label");
                container.classList.add("magicfeedback-boolean-option");
                container.htmlFor = `rating-${ref}-${index}`;
                container.style.cursor = "pointer";
                container.style.border = "1px solid #000";
                container.style.display = "flex";
                container.style.justifyContent = "center";
                container.style.alignItems = "center";
                container.style.margin = "auto";
                container.style.padding = "0";
                container.style.width = "45%";
                container.style.height = "38px";


                const label = document.createElement("label");
                label.htmlFor = `rating-${ref}-${index}`;
                label.textContent = option;
                label.style.margin = "0";
                label.style.padding = "0";

                const input = document.createElement("input");
                input.id = `rating-${ref}-${index}`;
                input.type = "radio";
                input.name = ref;
                input.value = option;
                input.classList.add(elementTypeClass);
                input.classList.add("magicfeedback-input");
                input.style.position = "absolute";
                input.style.opacity = "0";
                input.style.width = "0";
                input.style.height = "0";
                input.style.margin = "0";

                input.addEventListener("change", () => {
                    if (send) send();
                });

                container.appendChild(input);
                container.appendChild(label);
                booleanContainer.appendChild(container);
            });

            element.appendChild(booleanContainer);
            break;
        case FEEDBACKAPPANSWERTYPE.RATING_EMOJI:
            element = document.createElement("div");
            elementTypeClass = 'magicfeedback-rating';

            const ratingContainer = document.createElement('div');
            ratingContainer.classList.add('magicfeedback-rating-container');

            const maxRating = assets.max ? Number(assets.max) : 5;
            const minRating = assets.min ? Number(assets.min) : 1;

            const ratingPlaceholder = document.createElement('div');
            ratingPlaceholder.classList.add('magicfeedback-rating-placeholder');
            ratingPlaceholder.style.display = "flex";
            ratingPlaceholder.style.justifyContent = "space-between";
            ratingPlaceholder.style.width = "90%";
            ratingPlaceholder.style.margin = "auto";

            if (assets.minPlaceholder) {
                const ratingPlaceholderMin = document.createElement('span');
                ratingPlaceholderMin.textContent = assets.minPlaceholder;
                ratingPlaceholderMin.classList.add('magicfeedback-rating-placeholder-min');
                ratingPlaceholderMin.style.fontStyle = "italic";
                ratingPlaceholderMin.style.fontSize = "0.8em";

                ratingPlaceholder.appendChild(ratingPlaceholderMin);
            }

            if (assets.maxPlaceholder) {
                const ratingPlaceholderMax = document.createElement('span');
                ratingPlaceholderMax.textContent = assets.maxPlaceholder;
                ratingPlaceholderMax.classList.add('magicfeedback-rating-placeholder-max');
                ratingPlaceholderMax.style.fontStyle = "italic";
                ratingPlaceholderMax.style.fontSize = "0.8em";

                ratingPlaceholder.appendChild(ratingPlaceholderMax);
            }

            for (let i = minRating; i <= maxRating; i++) {
                const ratingOption = document.createElement('div');
                ratingOption.classList.add('magicfeedback-rating-option');

                const containerLabel = document.createElement('label');
                containerLabel.htmlFor = `rating-${ref}-${i}`;
                containerLabel.classList.add('magicfeedback-rating-option-label-container');

                const ratingLabel = document.createElement('label');
                ratingLabel.htmlFor = `rating-${ref}-${i}`;
                ratingLabel.textContent = i.toString();

                const ratingImage = document.createElement('img');
                ratingImage.alt = `face-${ref}-${i}`;
                ratingImage.className = `rating-image${i}`;

                if (minRating === 0 && maxRating === 10) {
                    ratingImage.src = `https://magicfeedback-c6458-dev.web.app/assets/${i}.svg`;
                } else if (minRating === 1 && maxRating === 5) {
                    switch (i) {
                        case 1:
                            ratingImage.src = "https://magicfeedback-c6458-dev.web.app/assets/1.svg";
                            break;
                        case 2:
                            ratingImage.src = "https://magicfeedback-c6458-dev.web.app/assets/2.svg";
                            break;
                        case 3:
                            ratingImage.src = "https://magicfeedback-c6458-dev.web.app/assets/6.svg";
                            break;
                        case 4:
                            ratingImage.src = "https://magicfeedback-c6458-dev.web.app/assets/9.svg";
                            break;
                        case 5:
                            ratingImage.src = "https://magicfeedback-c6458-dev.web.app/assets/10.svg";
                            break;
                    }
                } else {
                    const ratingNum = Math.round((i - minRating) * (10 / (maxRating - minRating)));

                    ratingImage.src = `https://magicfeedback-c6458-dev.web.app/assets/${ratingNum}.svg`;
                }

                const input = document.createElement("input");
                input.id = `rating-${ref}-${i}`;
                input.type = "radio";
                input.name = ref;
                input.value = i.toString();
                input.classList.add(elementTypeClass);
                input.classList.add("magicfeedback-input");

                containerLabel.appendChild(input);
                containerLabel.appendChild(ratingImage);
                containerLabel.appendChild(ratingLabel);

                ratingOption.appendChild(containerLabel);
                ratingContainer.appendChild(ratingOption);
            }

            if (assets.extraOption && assets.extraOptionText) {
                const extraOption = document.createElement('div');
                extraOption.classList.add('magicfeedback-rating-option');

                const containerLabel = document.createElement('label');
                containerLabel.htmlFor = `rating-${ref}-extra`;
                containerLabel.classList.add('magicfeedback-rating-option-label-container');

                const ratingLabel = document.createElement('label');
                ratingLabel.htmlFor = `rating-${ref}-extra`;
                ratingLabel.textContent = assets.extraOptionText;

                // Add a question mark icon to the extra option
                const ratingImage = document.createElement('img');
                ratingImage.src = "https://magicfeedback-c6458-dev.web.app/assets/question.svg";
                ratingImage.alt = `face-${ref}-extra`;
                ratingImage.className = `magicfeedback-rating-image-extra`;

                const input = document.createElement("input");
                input.id = `rating-${ref}-extra`;
                input.type = "radio";
                input.name = ref;
                input.value = '-';
                input.classList.add(elementTypeClass);
                input.classList.add("magicfeedback-input");

                containerLabel.appendChild(input);
                containerLabel.appendChild(ratingImage);
                containerLabel.appendChild(ratingLabel);

                extraOption.appendChild(containerLabel);
                ratingContainer.appendChild(extraOption);
            }

            element.appendChild(ratingPlaceholder);
            element.appendChild(ratingContainer);
            break;
        case FEEDBACKAPPANSWERTYPE.RATING_NUMBER:
            element = document.createElement("div");
            elementTypeClass = 'magicfeedback-rating-number';

            const ratingNumberContainer = document.createElement('div');
            ratingNumberContainer.classList.add('magicfeedback-rating-number-container');

            const maxRatingNumber = assets.max ? Number(assets.max) : 5;
            const minRatingNumber = assets.min ? Number(assets.min) : 1;

            const ratingNumberPlaceholder = document.createElement('div');
            ratingNumberPlaceholder.classList.add('magicfeedback-rating-number-placeholder');
            ratingNumberPlaceholder.style.display = "flex";
            ratingNumberPlaceholder.style.justifyContent = "space-between";
            ratingNumberPlaceholder.style.width = "90%";
            ratingNumberPlaceholder.style.margin = "auto";

            if (assets.minPlaceholder) {
                const ratingPlaceholderMin = document.createElement('span');
                ratingPlaceholderMin.textContent = assets.minPlaceholder;
                ratingPlaceholderMin.classList.add('magicfeedback-rating-number-placeholder-min');
                ratingPlaceholderMin.style.fontStyle = "italic";
                ratingPlaceholderMin.style.fontSize = "0.8em";

                ratingNumberPlaceholder.appendChild(ratingPlaceholderMin);
            }

            if (assets.maxPlaceholder) {
                const ratingPlaceholderMax = document.createElement('span');
                ratingPlaceholderMax.textContent = assets.maxPlaceholder;
                ratingPlaceholderMax.classList.add('magicfeedback-rating-number-placeholder-max');
                ratingPlaceholderMax.style.fontStyle = "italic";
                ratingPlaceholderMax.style.fontSize = "0.8em";

                ratingNumberPlaceholder.appendChild(ratingPlaceholderMax);
            }

            for (let i = minRatingNumber; i <= maxRatingNumber; i++) {
                // Create a input button element for each value in the question's value array
                const ratingOption = document.createElement('div');
                ratingOption.classList.add('magicfeedback-rating-number-option');

                const containerLabel = document.createElement('label');
                containerLabel.htmlFor = `rating-${ref}-${i}`;
                containerLabel.classList.add('magicfeedback-rating-number-option-label-container');

                const ratingLabel = document.createElement('label');
                ratingLabel.htmlFor = `rating-${ref}-${i}`;
                ratingLabel.textContent = i.toString();

                const input = document.createElement("input");
                input.id = `rating-${ref}-${i}`;
                input.type = "radio";
                input.name = ref;
                input.value = i.toString();
                input.classList.add(elementTypeClass);
                input.classList.add("magicfeedback-input");

                containerLabel.appendChild(input);
                containerLabel.appendChild(ratingLabel);
                ratingOption.appendChild(containerLabel);
                ratingNumberContainer.appendChild(ratingOption);
            }

            if (assets.extraOption && assets.extraOptionText) {
                const extraOption = document.createElement('div');
                extraOption.classList.add('magicfeedback-rating-number-option');

                const containerLabel = document.createElement('label');
                containerLabel.htmlFor = `rating-${ref}-extra`;
                containerLabel.classList.add('magicfeedback-rating-number-option-label-container');

                const ratingLabel = document.createElement('label');
                ratingLabel.htmlFor = `rating-${ref}-extra`;
                ratingLabel.textContent = assets.extraOptionText;

                const input = document.createElement("input");
                input.id = `rating-${ref}-extra`;
                input.type = "radio";
                input.name = ref;
                input.value = '-';
                input.classList.add(elementTypeClass);
                input.classList.add("magicfeedback-input");

                containerLabel.appendChild(input);
                containerLabel.appendChild(ratingLabel);
                extraOption.appendChild(containerLabel);
                ratingNumberContainer.appendChild(extraOption);
            }

            element.appendChild(ratingNumberPlaceholder);
            element.appendChild(ratingNumberContainer);

            break;
        case FEEDBACKAPPANSWERTYPE.RATING_STAR:
            element = document.createElement("div");
            elementTypeClass = 'magicfeedback-rating-star';

            const ratingStarContainer = createStarRating(ref);

            element.appendChild(ratingStarContainer);
            break;
        case FEEDBACKAPPANSWERTYPE.MULTIPLECHOISE_IMAGE:
            element = document.createElement("div");
            elementTypeClass = 'magicfeedback-multiple-choice-image';

            // Display de items inside a flex container if only have one item display it as a single image in the center, if have 2 items display them as a row, if have more than 2 items display them as a grid, if have 4 items display them as a 2x2 grid and if have 6 items display them as a 3x2 grid
            const multipleChoiceImageContainer = document.createElement("div");
            multipleChoiceImageContainer.classList.add("magicfeedback-multiple-choice-image-container");
            multipleChoiceImageContainer.style.display = "flex";
            multipleChoiceImageContainer.style.flexDirection = "row";
            multipleChoiceImageContainer.style.flexWrap = "wrap";
            multipleChoiceImageContainer.style.justifyContent = "center";


            const maxItems = value.length;
            let itemsPerRow = 1;
            let itemsPerColumn = 1;

            switch (maxItems) {
                case 1:
                case 2:
                case 3:
                    itemsPerRow = maxItems;
                    itemsPerColumn = 1;
                    break;
                case 4:
                case 5:
                case 6:
                    itemsPerColumn = 2;
                    itemsPerRow = Math.ceil(maxItems / itemsPerColumn);
                    break;
                case 7:
                case 8:
                case 9:
                    itemsPerColumn = 3;
                    itemsPerRow = Math.ceil(maxItems / itemsPerColumn);
                    break;
                default:
                    itemsPerColumn = 4;
                    itemsPerRow = Math.ceil(maxItems / itemsPerColumn);
                    break;
            }

            const useLabel = assets?.addTitle === undefined ? false : assets.addTitle;
            const multiOptions = assets?.multiOption === undefined ? false : assets.multiOption;
            const randomPosition = assets?.randomPosition === undefined ? false : assets.randomPosition;
            const extraOption = assets?.extraOption === undefined ? false : assets.extraOption;


            // reorder the options if randomPosition is true
            if (randomPosition) {
                value = value.sort(() => Math.random() - 0.5);
            }

        function generateOption(option: any) {
            try {
                const {position, url, value} = option;

                const container = document.createElement("label");
                container.classList.add("magicfeedback-multiple-choice-image-option");
                container.style.width = `calc( ${100 / itemsPerRow}% - 10px)`;
                container.style.height = `calc( ${100 / itemsPerColumn}% - 10px)`;
                container.style.margin = "5px";

                const containerLabel = document.createElement('label');
                containerLabel.htmlFor = `rating-${ref}-${position}`;
                containerLabel.classList.add('magicfeedback-image-option-label-container');
                containerLabel.style.display = "flex";
                containerLabel.style.flexDirection = "column";

                // Add a effect on hover and on select
                containerLabel.addEventListener("mouseover", () => {
                    containerLabel.style.border = "2px solid #000";
                });
                containerLabel.addEventListener("mouseout", () => {
                    containerLabel.style.border = "none";
                });
                containerLabel.addEventListener("click", () => {
                    containerLabel.style.border = "2px solid #000";
                });


                const label = document.createElement("label");
                label.textContent = value;
                label.classList.add("magicfeedback-multiple-choice-image-label");

                const input = document.createElement("input");
                input.id = `rating-${ref}-${position}`;
                input.type = multiOptions ? "checkbox" : "radio";
                input.name = ref;
                input.value = value;
                input.style.position = "absolute";
                input.style.opacity = "0";
                input.style.width = "0";
                input.style.height = "0";
                input.classList.add("magicfeedback-input");

                // Add max size to the image
                const image = document.createElement("img");
                image.classList.add("magicfeedback-multiple-choice-image-image");
                image.src = url;
                image.style.cursor = "pointer";
                image.style.backgroundSize = "cover";
                image.style.backgroundPosition = "center";
                image.style.width = "100%";
                image.style.height = "100%";
                image.style.objectFit = "cover";
                image.style.margin = "auto";

                containerLabel.appendChild(input);
                containerLabel.appendChild(image);
                if (useLabel) containerLabel.appendChild(label);
                container.appendChild(containerLabel);
                multipleChoiceImageContainer.appendChild(container);

            } catch (e) {
                console.error(e);
            }
        }

            // The image is the only input but can have a title
            value.forEach((option) => generateOption(JSON.parse(option)));

            if (extraOption && assets.extraOptionValue && assets.extraOptionValue.length > 0) {
                generateOption(assets.extraOptionValue[0])
            }

            element.appendChild(multipleChoiceImageContainer);
            break;
        case FEEDBACKAPPANSWERTYPE.SELECT:
            // Create a select element for RADIO and MULTIPLECHOICE types
            element = document.createElement("select");
            elementTypeClass = "magicfeedback-select";

            // Create an option <option value="" disabled selected hidden>Please Choose...</option>
            const option = document.createElement("option");
            option.value = "";
            option.text = format === 'slim' ? parseTitle(title, language) : (defaultValue || "Select an option");
            option.disabled = true;
            option.selected = true;
            (element as HTMLSelectElement).appendChild(option);

            value.forEach((optionValue) => {
                // Create an option element for each value in the question's value array
                const option = document.createElement("option");
                option.value = optionValue;
                option.text = optionValue;
                (element as HTMLSelectElement).appendChild(option);
            });
            break;
        case FEEDBACKAPPANSWERTYPE.DATE:
            // Create an input element with type "date" for DATE type
            element = document.createElement("input");
            (element as HTMLInputElement).type = "date";
            (element as HTMLInputElement).required = require;
            (element as HTMLInputElement).placeholder = placeholderText || placeholder.date(language || 'en');
            elementTypeClass = "magicfeedback-date";
            break;
        case FEEDBACKAPPANSWERTYPE.CONSENT:
            // Create an input element with type "checkbox" for BOOLEAN type
            element = document.createElement("input");
            elementTypeClass = "magicfeedback-consent";

            (element as HTMLInputElement).type = "checkbox";
            element.id = `magicfeedback-${id}`;
            (element as HTMLInputElement).name = ref;
            (element as HTMLInputElement).value = "true";
            (element as HTMLInputElement).required = require;
            element.classList.add("magicfeedback-consent");
            element.classList.add("magicfeedback-input");
            break;
        case FEEDBACKAPPANSWERTYPE.EMAIL:
            // Create an input element with type "email" for EMAIL type
            element = document.createElement("input");
            (element as HTMLInputElement).type = "email";
            (element as HTMLInputElement).required = require;
            (element as HTMLInputElement).placeholder = placeholderText || "you@example.com";
            elementTypeClass = "magicfeedback-email";
            break;
        case FEEDBACKAPPANSWERTYPE.PASSWORD:
            // Create an input element with type "password" for PASSWORD type
            element = document.createElement("input");
            (element as HTMLInputElement).type = "password";
            (element as HTMLInputElement).required = require;
            (element as HTMLInputElement).placeholder = placeholderText || placeholder.password(language || 'en');
            elementTypeClass = "magicfeedback-password";
            break;
        case FEEDBACKAPPANSWERTYPE.MULTI_QUESTION_MATRIX:
            element = document.createElement("div");
            elementTypeClass = "magicfeedback-multi-question-matrix";

            const matrixContainer = document.createElement("div");
            matrixContainer.classList.add("magicfeedback-multi-question-matrix-container");

            //The matrix have a table format with the questions in the rows and the options in the columns, all the options have a title in the header of the column and is posssioble select moere than one option per question
            const table = document.createElement("table");
            table.classList.add("magicfeedback-multi-question-matrix-table");

            // Create the header of the table
            const header = document.createElement("thead");
            header.classList.add("magicfeedback-multi-question-matrix-header");
            header.style.paddingBottom = "15px";
            const headerRow = document.createElement("tr");

            ["", ...value].forEach((option) => {
                const headerCell = document.createElement("th");
                headerCell.textContent = option;
                headerCell.style.padding = "0 10px 10px 10px ";
                headerRow.appendChild(headerCell);
            });

            header.appendChild(headerRow);

            // Create the body of the table
            const body = document.createElement("tbody");

            if (assets?.options?.length > 0) {
                assets.options.split(',').forEach((o: string) => {
                    const row = document.createElement("tr");
                    row.style.paddingBottom = "15px";
                    const rowLabel = document.createElement("td");
                    rowLabel.classList.add("magicfeedback-multi-question-matrix-row-label");
                    const label = document.createElement("label");
                    label.classList.add("magicfeedback-multi-question-matrix-label");
                    label.style.paddingRight = "15px";
                    label.textContent = o;

                    rowLabel.appendChild(label);
                    row.appendChild(rowLabel);

                    value.forEach((v) => {
                        const cell = document.createElement("td");
                        const input = document.createElement("input");
                        input.type = "checkbox";
                        input.name = ref;
                        input.value = v;
                        input.id = `matrix-${o}`;
                        input.classList.add("magicfeedback-input");
                        input.style.padding = "0 10px";
                        cell.appendChild(input);
                        row.appendChild(cell);
                    });

                    body.appendChild(row);
                });
            }

            table.appendChild(header);
            table.appendChild(body);
            matrixContainer.appendChild(table);
            element.appendChild(matrixContainer);
            break;
        case FEEDBACKAPPANSWERTYPE.PRIORITY_LIST:
            element = document.createElement("div");
            elementTypeClass = "magicfeedback-priority-list";

            const priorityListContainer = document.createElement("div");
            priorityListContainer.classList.add("magicfeedback-priority-list-container");

            // The priority list have a list of items that the user can order by priority,
            // the item is a card with the number of the position and title in the left and a
            // arrow up and down to change the position of the item
            const list = document.createElement("ul");
            list.classList.add("magicfeedback-priority-list-list");

            value.forEach((option, index) => {
                const item = document.createElement("li");
                item.classList.add("magicfeedback-priority-list-item");
                item.style.display = "flex";
                item.style.justifyContent = "space-between";
                item.style.alignItems = "center";
                item.style.margin = "5px";

                // Add input position
                const input = document.createElement("input");
                input.classList.add("magicfeedback-input-magicfeedback-priority-list");
                input.classList.add("magicfeedback-input");
                input.type = "hidden";
                input.id = `priority-list-${ref}`;
                input.name = ref
                input.value = `${index + 1}. ${option}`;
                item.appendChild(input);

                const itemLabel = document.createElement("label");
                itemLabel.classList.add("magicfeedback-priority-list-item-label");
                itemLabel.textContent = `${index + 1}. ${option}`;
                item.appendChild(itemLabel);

                const arrowContainer = document.createElement("div");
                arrowContainer.style.display = "flex";
                arrowContainer.style.alignItems = "center";
                arrowContainer.style.justifyContent = "space-between";

                const upArrow = document.createElement("img");
                upArrow.classList.add("magicfeedback-priority-list-arrow-up");
                // Add a up arrow svg icon
                upArrow.src = "https://magicfeedback-c6458-dev.web.app/assets/arrow.svg";
                upArrow.style.width = "20px";
                upArrow.style.height = "20px";
                upArrow.style.cursor = "pointer";
                upArrow.style.margin = "0 5px";
                upArrow.style.color = "#000";
                upArrow.style.visibility = index === 0 ? "hidden" : "visible";

                upArrow.addEventListener("click", () => {
                    const previous = item.previousElementSibling;
                    if (previous) {
                        const position = Number(input.value.split(".")[0]) - 1;
                        input.value = `${position}. ${option}`;
                        itemLabel.textContent = `${position}. ${option}`;
                        upArrow.style.visibility = position === 1 ? "hidden" : "visible";
                        downArrow.style.visibility = position === value.length ? "hidden" : "visible";

                        // Update the value of the item that had the new value to update the order
                        const previousInput = previous.querySelector(".magicfeedback-input-magicfeedback-priority-list");
                        const previousLabel = previous.querySelector(".magicfeedback-priority-list-item-label");
                        const previousArrowUp = previous.querySelector(".magicfeedback-priority-list-arrow-up");
                        const previousArrowDown = previous.querySelector(".magicfeedback-priority-list-arrow-down");

                        if (previousInput && previousLabel && previousArrowUp && previousArrowDown) {
                            const newPosition = Number((previousInput as HTMLInputElement).value.split(".")[0]) + 1;
                            (previousInput as HTMLInputElement).value = `${newPosition}.${previousLabel.textContent?.split(".")[1]}`;
                            previousLabel.textContent = `${newPosition}.${previousLabel.textContent?.split(".")[1]}`;
                            (previousArrowUp as HTMLInputElement).style.visibility = newPosition === 1 ? "hidden" : "visible";
                            (previousArrowDown as HTMLInputElement).style.visibility = newPosition === value.length ? "hidden" : "visible";
                        }

                        list.insertBefore(item, previous);
                    }
                })

                arrowContainer.appendChild(upArrow);

                const downArrow = document.createElement("img");
                downArrow.classList.add("magicfeedback-priority-list-arrow-down");
                // Add a down arrow svg icon
                downArrow.src = "https://magicfeedback-c6458-dev.web.app/assets/arrow.svg";
                downArrow.style.width = "20px";
                downArrow.style.height = "20px";
                downArrow.style.cursor = "pointer";
                downArrow.style.margin = "0 5px";
                downArrow.style.color = "#000";
                downArrow.style.transform = "rotate(180deg)";
                // Hidden if is the bottom
                downArrow.style.visibility = index === value.length - 1 ? "hidden" : "visible";


                downArrow.addEventListener("click", () => {
                    const next = item.nextElementSibling;
                    if (next) {
                        const position = Number(input.value.split(".")[0]) + 1;
                        input.value = position.toString();
                        itemLabel.textContent = `${position.toString()}. ${option}`;
                        upArrow.style.visibility = position === 1 ? "hidden" : "visible";
                        downArrow.style.visibility = position === value.length ? "hidden" : "visible";

                        // Update the value of the item that had the new value to update the order
                        const nextInput = next.querySelector(".magicfeedback-input-magicfeedback-priority-list");
                        const nextLabel = next.querySelector(".magicfeedback-priority-list-item-label");
                        const nextArrowUp = next.querySelector(".magicfeedback-priority-list-arrow-up");
                        const nextArrowDown = next.querySelector(".magicfeedback-priority-list-arrow-down");

                        if (nextInput && nextLabel && nextArrowUp && nextArrowDown) {
                            const newPosition = Number((nextInput as HTMLInputElement).value.split(".")[0]) - 1;
                            (nextInput as HTMLInputElement).value = `${newPosition}.${nextLabel.textContent?.split(".")[1]}`;
                            nextLabel.textContent = `${newPosition}.${nextLabel.textContent?.split(".")[1]}`;
                            (nextArrowUp as HTMLInputElement).style.visibility = newPosition === 1 ? "hidden" : "visible";
                            (nextArrowDown as HTMLInputElement).style.visibility = newPosition === value.length ? "hidden" : "visible";
                        }

                        list.insertBefore(next, item);
                    }
                })

                arrowContainer.appendChild(downArrow);
                item.appendChild(arrowContainer);

                list.appendChild(item);
            });

            priorityListContainer.appendChild(list);
            element.appendChild(priorityListContainer);
            break;
        case FEEDBACKAPPANSWERTYPE.POINT_SYSTEM:
            element = document.createElement("div");
            elementTypeClass = "magicfeedback-point-system";

            const pointSystemContainer = document.createElement("div");
            pointSystemContainer.classList.add("magicfeedback-point-system-container");

            // The point system have a list of items that the user can assign a value, the user can assign a value to each item in % of the total points but the total points can't be more than 100
            const pointSystemList = document.createElement("ul");
            pointSystemList.classList.add("magicfeedback-point-system-list");
            pointSystemList.style.padding = "0";

            const totalPoints = 100;
            const pointsPerItem = totalPoints / value.length;

            //Add a total points counter
            const totalPointsContainer = document.createElement("div");
            totalPointsContainer.classList.add("magicfeedback-point-system-total");
            totalPointsContainer.textContent = `0 / 100 %`;
            totalPointsContainer.style.textAlign = "right";
            totalPointsContainer.style.fontSize = "0.8em";
            totalPointsContainer.style.color = "#999";
            totalPointsContainer.style.marginTop = "5px";

            value.forEach((option) => {
                const item = document.createElement("li");
                item.classList.add("magicfeedback-point-system-item");
                item.style.display = "flex";
                item.style.justifyContent = "space-between";
                item.style.alignItems = "center";
                item.style.margin = "5px";

                const itemLabel = document.createElement("label");
                itemLabel.textContent = option;
                item.appendChild(itemLabel);

                const inputContainer = document.createElement("span");
                inputContainer.classList.add("magicfeedback-point-system-input-container");

                const itemInput = document.createElement("input");
                itemInput.name = ref;
                itemInput.id = `point-system-${option}`;
                itemInput.type = "number";
                itemInput.min = "0";
                itemInput.max = `${totalPoints}`;
                itemInput.value = `0`;
                itemInput.classList.add("magicfeedback-input");
                itemInput.style.width = "40px";
                itemInput.style.border = "0";
                itemInput.style.textAlign = "center";
                itemInput.style.margin = "0 5px";
                // Add the % symbol to the input
                const percentSymbol = document.createElement("span");
                percentSymbol.textContent = "%";
                percentSymbol.style.color = "#000";


                // Control the total points assigned to the items
                itemInput.addEventListener("input", () => {
                    const allInputs = pointSystemList.querySelectorAll("input");
                    let total = 0;
                    allInputs.forEach((input) => {
                        total += Number((input as HTMLInputElement).value);
                    });

                    if (total > totalPoints) {
                        itemInput.value = `${pointsPerItem}%`;
                        total = total - Number((itemInput as HTMLInputElement).value);
                    }

                    totalPointsContainer.textContent = `${total} / 100 %`;
                });

                inputContainer.appendChild(itemInput);
                inputContainer.appendChild(percentSymbol);

                item.appendChild(inputContainer);
                pointSystemList.appendChild(item);
            });


            pointSystemContainer.appendChild(pointSystemList);
            pointSystemContainer.appendChild(totalPointsContainer);
            element.appendChild(pointSystemContainer);
            break;
        default:
            return elementContainer;
    }

    element.id = `magicfeedback-${id}`;
    element.setAttribute("name", ref);
    element.classList.add(elementTypeClass);

    if (defaultValue !== undefined || urlParamValue !== null) {
        (element as HTMLInputElement).value = urlParamValue || defaultValue;
    }

    if (!["RADIO", "MULTIPLECHOICE"].includes(type)) {
        element.classList.add("magicfeedback-input");
        (element as HTMLInputElement).required = require;
    }

    // Add the label and input element to the form
    const label = document.createElement("label");
    label.setAttribute("for", `magicfeedback-${id}`);
    label.textContent = parseTitle(title, language);
    label.classList.add("magicfeedback-label");

    if (["CONSENT"].includes(type)) {
        elementContainer.classList.add("magicfeedback-consent-container");
        elementContainer.appendChild(element);
        elementContainer.appendChild(label);
    } else {
        if (format !== 'slim') {
            elementContainer.appendChild(label);
            if (assets?.general !== undefined && assets?.general !== "") {
                // Add a image to the form
                const image = document.createElement("img");
                image.src = assets.general;
                image.classList.add("magicfeedback-image");
                // Add a max default width to the image
                image.style.maxWidth = "auto";
                image.style.height = "400px";
                image.style.margin = "10px 0";

                elementContainer.appendChild(image);
            }
        }

        if (type === "LONGTEXT") {
            const counter = document.createElement("div");
            counter.classList.add("magicfeedback-counter");
            counter.textContent = "0/300";
            counter.style.textAlign = "right";
            counter.style.fontSize = "0.8em";
            counter.style.color = "#999";
            counter.style.marginTop = "5px";

            element.addEventListener("input", () => {
                counter.textContent = `${(element as HTMLTextAreaElement).value.length}/300`;
            });

            elementContainer.appendChild(element);
            elementContainer.appendChild(counter);

            if (assets.extraOption && assets.extraOptionText) {
                const skipContainer = document.createElement("div");
                skipContainer.classList.add("magicfeedback-skip-container");
                skipContainer.classList.add(`magicfeedback-checkbox-container`);
                skipContainer.style.display = "flex";
                skipContainer.style.justifyContent = "flex-start";
                // Option to skip the question checkbox
                const skipButton = document.createElement("input");
                skipButton.classList.add("magicfeedback-skip");
                skipButton.type = "checkbox";
                skipButton.id = `skip-${ref}`;
                skipButton.name = ref;
                skipButton.value = '-';
                skipButton.style.cursor = "pointer";

                const skipLabel = document.createElement("label");
                skipLabel.htmlFor = `skip-${ref}`;
                skipLabel.textContent = assets.extraOptionText;
                skipLabel.style.fontSize = "0.8em";
                skipLabel.style.color = "#999";
                skipLabel.style.cursor = "pointer";
                skipLabel.style.margin = "0 5px";

                skipButton.addEventListener("click", () => {
                    (element as HTMLTextAreaElement).value = '-'
                    if (send) send();
                });

                skipContainer.appendChild(skipButton);
                skipContainer.appendChild(skipLabel);

                elementContainer.appendChild(skipContainer);
            }

        } else {
            elementContainer.appendChild(element);
        }

    }

    return elementContainer;
}

export function renderActions(identity: string = '',
                              backAction: () => void,
                              sendButtonText: string = "Submit",
                              backButtonText: string = "Back",
                              nextButtonText: string = "Next"
): HTMLElement {
    const actionContainer = document.createElement("div");
    actionContainer.classList.add("magicfeedback-action-container");

    // Create a submit button if specified in options
    const submitButton = document.createElement("button");
    submitButton.id = "magicfeedback-submit";
    submitButton.type = "submit";
    submitButton.classList.add("magicfeedback-submit");
    submitButton.textContent = identity === 'MAGICSURVEY' ? (nextButtonText || "Next") : (sendButtonText || "Submit")

    // Create a back button
    const backButton = document.createElement("button");
    backButton.id = "magicfeedback-back";
    backButton.type = "button";
    backButton.classList.add("magicfeedback-back");
    backButton.textContent = backButtonText || "Back";
    backButton.addEventListener("click", backAction);

    if (identity === 'MAGICSURVEY') {
        actionContainer.appendChild(backButton);
    }

    actionContainer.appendChild(submitButton);

    return actionContainer;
}

function createStarRating(ref: string) {
    const size = 40;
    const selectedClass = "magicfeedback-rating-star-selected";
    const starFilled = "★";

    const ratingContainer = document.createElement("div");
    ratingContainer.classList.add("magicfeedback-rating-star-container");

    for (let i = 1; i <= 5; i++) {
        const ratingOption = document.createElement("label");
        ratingOption.classList.add("magicfeedback-rating-star-option");

        // Create hidden radio input
        const ratingInput = document.createElement("input");
        ratingInput.id = `rating-${ref}-${i}`;
        ratingInput.type = "radio";
        ratingInput.name = ref;
        ratingInput.value = i.toString();
        ratingInput.style.position = "absolute";
        ratingInput.style.opacity = "0";
        ratingInput.style.width = "0";
        ratingInput.style.height = "0";
        ratingInput.classList.add("magicfeedback-input");

        // Update filled stars on radio input change
        ratingInput.addEventListener("change", () => {
            const allStars = ratingContainer.querySelectorAll(".rating__star");

            for (let j = 0; j < allStars.length; j++) {
                // String to number
                if (j + 1 <= Number(ratingInput.value)) {
                    if (!allStars[j].classList.contains(selectedClass)) allStars[j].classList.add(selectedClass);
                } else {
                    if (allStars[j].classList.contains(selectedClass)) allStars[j].classList.remove(selectedClass);
                }
            }
        });

        ratingOption.appendChild(ratingInput);

        // Create star element (after for better positioning)
        const starElement = document.createElement("label");
        starElement.htmlFor = `rating-${ref}-${i}`;
        starElement.classList.add("rating__star");
        starElement.textContent = starFilled;
        starElement.style.fontSize = `${size}px`; // Set star size
        starElement.style.color = "#CCCCCC"; // Set star color
        starElement.style.cursor = "pointer";
        // Add hover effect
        ratingOption.appendChild(starElement);


        ratingContainer.appendChild(ratingOption);
    }

    return ratingContainer;
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

export function renderStartMessage(
    startMessage: string,
    startEvent: () => void,
    addButton: boolean = false,
    startButtonText: string = "Go!",
): HTMLElement {
    const startMessageContainer = document.createElement("div");
    startMessageContainer.classList.add("magicfeedback-start-message-container");

    const startMessageElement = document.createElement("div");
    startMessageElement.classList.add("magicfeedback-start-message");
    startMessageElement.innerHTML = startMessage;

    const startMessageButton = document.createElement("button");
    startMessageButton.id = "magicfeedback-start-message-button";
    startMessageButton.classList.add("magicfeedback-start-message-button");
    startMessageButton.textContent = startButtonText;

    startMessageButton.addEventListener("click", () => startEvent());

    startMessageContainer.appendChild(startMessageElement);
    if (addButton) startMessageContainer.appendChild(startMessageButton);

    return startMessageContainer;
}
