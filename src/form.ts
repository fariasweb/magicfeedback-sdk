import { NativeQuestion, generateFormOptions, NativeAnswer } from "./types";
import { Request } from "./request";
import { Config } from "./config";
import { Log } from "./log";

export class Form {
  /**
   * Attributes
   */
  private config: Config;
  private request: Request;
  private log: Log;

  private appId: string;
  

  /**
   *
   * @param config
   * @param appId
   */
  constructor(config: Config, appId: string) {
    // Config
    this.config = config;
    this.request = new Request();
    this.log = new Log(config);

    // Attributes
    this.appId = appId;
  }

  /**
   * Generate
   * @param appId
   */
  public generate(selector: string, options: generateFormOptions = {}) {

    //TODO: Check if already exist the form

    // Request question from the app
    this.request
      .get(`${this.config.get("url")}/apps/${this.appId}/questions`, {})
      .then((appQuestions) => {
        if (appQuestions === undefined || !appQuestions) {
          this.log.err(`No questions for app ${this.appId}`);
        }
        // Create the from from the JSON
        this.generateForm(this.appId, appQuestions, selector, options);
      });
  }

  /**
   * Create
   * @param appId
   * @param appQuestions
   * @param selector
   * @param options
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
        //require,
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
          elementTypeClass = "magicfeedback-text";
          break;
        case "LONGTEXT":
          // Create a textarea element for TEXT and LONGTEXT types
          element = document.createElement("textarea");
          (element as HTMLTextAreaElement).rows = 3; // Set the number of rows based on the type
          elementTypeClass = "magicfeedback-longtext";
          break;
        case "NUMBER":
          // Create an input element with type "number" for NUMBER type
          element = document.createElement("input");
          (element as HTMLInputElement).type = "number";
          elementTypeClass = "magicfeedback-number";

          if (value.length) {
            value.sort((a: string, b: string) => {
              let aa = Number(a);
              let bb = Number(b);
              return aa - bb;
            });
            (element as HTMLInputElement).max = value[value.length - 1];
            (element as HTMLInputElement).min = value[0];
            (element as HTMLInputElement).value = value[0];
          }
          break;
        case "RADIO":
        case "MULTIPLECHOICE":
          element = document.createElement("div");
          elementTypeClass =
            "magicfeedback-" + (type === "RADIO" ? "radio" : "checkbox");

          value.forEach((option) => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = type === "RADIO" ? "radio" : "checkbox";
            input.name = ref;
            input.value = option;
            if (option === defaultValue) {
              input.checked = true;
            }
            label.textContent = option;
            element.appendChild(input);
            element.appendChild(label);
          });
          break;
        case "SELECT":
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

      // Add the label and input element to the form
      const label = document.createElement("label");
      label.setAttribute("for", `magicfeedback-${id}`);
      label.textContent = title;
      label.classList.add("magicfeedback-label");
      elementContainer.appendChild(label);

      element.classList.add(elementTypeClass);
      element.classList.add("magicfeedback-input");
      elementContainer.appendChild(element);

      form.appendChild(elementContainer);
    });

    // Submit button
    if (options.addButton) {
      // Create a submit button if specified in options
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Submit";
      submitButton.classList.add("magicfeedback-submit");

      form.appendChild(submitButton);
    }

    // Add the form to the specified container
    container.appendChild(form);

    // Submit event
    /*if (options.submitEvent) {
      // Add a submit event listener if specified in options
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        //options.submitEvent();
  
        //TODO: Add default submit button
      });
    } else {
      //TODO: Add default submit button
    }*/
  }

  /**
   * Answer
   * @param appId
   * @returns
   */
  public answer(): NativeAnswer[] {
    const form: HTMLElement | null = document.getElementById(
      "magicfeedback-" + this.appId
    );

    if (!form) {
      console.error(`Form "${form}" not found.`);
      return [];
    }

    const surveyAnswers: NativeAnswer[] = [];

    const inputs = form.querySelectorAll(".magicfeedback-input");
    inputs.forEach((input) => {
      const inputType = (input as HTMLInputElement).type;

      const ans: NativeAnswer = {
        id: (input as HTMLInputElement).name,
        type: inputType,
        value: [],
      };

      if (inputType === "radio" || inputType === "checkbox") {
        if ((input as HTMLInputElement).checked) {
          ans.value.push((input as HTMLInputElement).value);
          surveyAnswers.push(ans);
        }
      } else {
        ans.value.push((input as HTMLInputElement).value);
        surveyAnswers.push(ans);
      }
    });

    return surveyAnswers;
  }


  /**
   * Send -> Pre / Post function
   */
  public send() {}
}
