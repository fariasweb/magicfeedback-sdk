import { InitOptions, NativeFeedback, NativeQuestion } from "./types";
import { API_URL } from "./config";
import { requestPOST, requestGET } from "./request";

/**
 *
 * @returns
 */
export default function main() {
  //===============================================
  // Attributes
  //===============================================

  let url: string = API_URL;
  let debug = false;

  //===============================================
  // Private
  //===============================================

  /**
   *
   * @returns
   */
  function getUrl() {
    return `${url}`;
  }

  /**
   *
   * @param args
   */
  function log(...args: any[]) {
    if (debug) {
      console.log("[MagicFeedback]:", ...args);
    }
  }

  /**
   *
   * @param args
   */
  function err(...args: any[]): never {
    if (debug) {
      console.error("[MagicFeedback]:", ...args);
    }
    throw new Error(...args);
  }

  /**
   *
   * @param json
   * @param selector
   * @param options
   * @returns
   */
  function createFormFromJSON(
    appId: string,
    json: NativeQuestion[],
    selector: string,
    options: { addButton?: boolean; submitEvent?: Function } = {}
  ) {
    const formContainer = document.querySelector(selector);
    if (!formContainer) {
      console.error(`Selector "${selector}" not found.`);
      return;
    }

    const form = document.createElement("form");
    form.id = "magicfeedback-native-" + appId;

    json.forEach((field: NativeQuestion) => {
      const { id, title, type, ref, require, value, defaultValue } = field;

      let inputElement: HTMLElement;

      console.log(field);
      console.log(id, title, type, ref, require, value, defaultValue);

      if (type === "RADIO") {
        // Create radio buttons for the options
        const radioContainer = document.createElement("div");
        value.forEach((radioOption: string) => {
          const radioLabel = document.createElement("label");
          const radioInput = document.createElement("input");
          radioInput.type = "radio";
          radioInput.name = ref;
          radioInput.value = radioOption;
          radioInput.required = require;
          radioLabel.textContent = radioOption;
          radioLabel.appendChild(radioInput);
          radioContainer.appendChild(radioLabel);
        });

        inputElement = radioContainer;
      } else if (type === "TEXT") {
        // Create a text input field
        const textField = document.createElement("input");
        textField.type = "text";
        textField.name = ref;
        textField.required = require;
        textField.value = defaultValue;

        inputElement = textField;
      } else {
        console.error(`Invalid field type: ${type}`);
        return;
      }

      // Create a label for the field
      const label = document.createElement("label");
      label.textContent = title;
      label.htmlFor = id;

      // Add the label and input element to the form
      form.appendChild(label);
      form.appendChild(inputElement);
    });

    if (options.addButton) {
      // Create a submit button if specified in options
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Submit";

      form.appendChild(submitButton);
    }

    // Add the form to the specified container
    formContainer.appendChild(form);

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

  //===============================================
  // Public
  //===============================================

  /**
   *
   * @param options
   */
  function init(options?: InitOptions) {
    if (options?.url) url = options?.url;
    if (options?.debug) debug = options?.debug;

    log("Initialized Magicfeedback", options);
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
    if (!appId) err("No appID provided");
    if (!answers) err("No answers provided");
    if (answers.length == 0) err("Answers are empty");

    const payload: NativeFeedback = {
      appId: appId,
      answers: answers,
    };

    if (profile) payload.profile = profile;

    let res = {};
    try {
      res = await requestPOST(`${getUrl()}/feedback/apps`, payload);
      log(`sent native feedback`, res);
    } catch (e: any) {
      err(`error native feedback`, e);
    }
    return res;
  }

  /**
   *
   */
  type FormOptions = {
    addButton?: boolean;
    submitEvent?: Function;
  };

  /**
   *
   * @param appId
   * @param selector
   * @param options
   */
  async function form(
    appId: NativeFeedback["appId"],
    selector: string,
    options: FormOptions = {}
  ) {
    // Params control
    if (!appId) err("No appID provided");

    // Request question from the app
    requestGET(`${getUrl()}/apps/${appId}/questions`, {}).then(
      (appQuestions) => {
        if (appQuestions === undefined || !appQuestions) {
          err(`No questions for app ${appId}`);
        }
        // Create the from from the JSON
        createFormFromJSON(appId, appQuestions, selector, options);
      }
    );
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
