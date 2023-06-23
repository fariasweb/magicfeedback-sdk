import { NativeQuestion } from "./types";

/**
   *
   * @param appId
   * @param appQuestions
   * @param selector
   * @param options
   */
export function generateForm(
    appId: string,
    appQuestions: NativeQuestion[],
    selector: string,
    options: { addButton?: boolean; submitEvent?: Function } = {}
  ) {

    // Select the container
    const container: HTMLElement | null = document.getElementById(selector);
    if (!container) {
      console.error(`Selector "${selector}" not found.`);
      return;
    }
    container.classList.add("magicfeedback-container");

    // Create the form
    const form = document.createElement("form");
    form.classList.add("magicfeedback-form");
    form.id = "magicfeedback-" + appId;

    // Process questions and create in the form
    appQuestions.forEach((question) => {
      const {
        id,
        title,
        type,
        ref,
        require,
        external_id,
        value,
        defaultValue,
      } = question;

      let element: HTMLElement;
      let elementTypeClass: string;

      switch (type) {
        case "TEXT":
          // Create a text input field
          element = document.createElement("input");
          (element as HTMLInputElement).type = "text";
          elementTypeClass = "magicfeedback-text";

        case "LONGTEXT":
          // Create a textarea element for TEXT and LONGTEXT types
          element = document.createElement("textarea");
          (element as HTMLTextAreaElement).rows = type === "TEXT" ? 1 : 3; // Set the number of rows based on the type
          elementTypeClass = "magicfeedback-textarea";
          break;
        case "NUMBER":
          // Create an input element with type "number" for NUMBER type
          element = document.createElement("input");
          (element as HTMLInputElement).type = "number";
          elementTypeClass = "magicfeedback-number";
          break;
        case "RADIO":
        case "MULTIPLECHOICE":
          // Create a select element for RADIO and MULTIPLECHOICE types
          element = document.createElement("select");
          elementTypeClass = "magicfeedback-select";

          value.forEach((optionValue) => {
            // Create an option element for each value in the question's value array
            const option = document.createElement("option");
            option.value = optionValue;
            option.text = optionValue;
            (element as HTMLSelectElement).appendChild(option);
          });

          if (type === "MULTIPLECHOICE") {
            (element as HTMLSelectElement).multiple = true;
          }
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
        default:
          return; // Skip unknown types
      }

      element.id = `magicfeedback-${id}`;
      element.setAttribute("name", ref);
      //element.required = require === "true";

      if (defaultValue !== undefined) {
        (element as HTMLInputElement).value = defaultValue;
      }

      element.classList.add(elementTypeClass);
      form.appendChild(element);

      // Add the label and input element to the form
      const label = document.createElement("label");
      label.setAttribute("for", `magicfeedback-${id}`);
      label.textContent = title;
      label.classList.add("magicfeedback-label");
      form.appendChild(label);
    });

    // Submit button
    if (options.addButton) {
      // Create a submit button if specified in options
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Submit";

      form.appendChild(submitButton);
    }

    // Add the form to the specified container
    container.appendChild(form);

    // Submit event
    if (options.submitEvent) {
      // Add a submit event listener if specified in options
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        //options.submitEvent();

        //TODO: Add default submit button
      });
    } else {
      //TODO: Add default submit button
    }
  }