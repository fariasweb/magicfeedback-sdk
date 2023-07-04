import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  NativeQuestion,
  FEEDBACKAPPANSWERTYPE,
  generateFormOptions,
} from "../src/types";

import { Form } from "../src/form";
import { Config } from "../src/config";

/**
 * Form.generate
 */
describe("Form.generate", () => {
  let container: HTMLElement;

  /**
   * @jest-environment jsdom
   */
  beforeEach(() => {
    // Create a container element for the form
    container = document.createElement("div");
    container.id = "form-container";
    document.body.appendChild(container);
  });

  /**
   *
   */
  afterEach(() => {
    // Clean up the container element after each test
    container.remove();
  });

  /**
   *
   */
  test("should generate a form with text input fields", () => {
    const questions: NativeQuestion[] = [
      {
        id: "1",
        title: "Name",
        type: FEEDBACKAPPANSWERTYPE.TEXT,
        ref: "name",
        require: true,
        external_id: "123",
        value: [],
        defaultValue: "",
        appId: "456",
      },
      {
        id: "2",
        title: "Email",
        type: FEEDBACKAPPANSWERTYPE.TEXT,
        ref: "email",
        require: true,
        external_id: "456",
        value: [],
        defaultValue: "",
        appId: "789",
      },
    ];

    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container");

    const formSelect = container.querySelector("form");
    const nameInput = container.querySelector('input[name="name"]');
    const emailInput = container.querySelector('input[name="email"]');

    expect(formSelect).not.toBeNull();
    expect(nameInput).not.toBeNull();
    expect(emailInput).not.toBeNull();
    expect(nameInput?.getAttribute("type")).toBe("text");
    expect(emailInput?.getAttribute("type")).toBe("text");
  });

  /**
   *
   */
  test("should generate a form with a submit button", () => {
    const questions: NativeQuestion[] = [];

    let options: generateFormOptions = { addButton: true };
    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container", options);

    const formSelect = container.querySelector("form");
    const submitButton = container.querySelector('button[type="submit"]');

    expect(formSelect).not.toBeNull();
    expect(submitButton).not.toBeNull();
    expect(submitButton?.textContent).toBe("Submit");
  });

  test("should generate a form with a textarea for LONGTEXT type", () => {
    const questions: NativeQuestion[] = [
      {
        id: "3",
        title: "Feedback",
        type: FEEDBACKAPPANSWERTYPE.LONGTEXT,
        ref: "feedback",
        require: true,
        external_id: "789",
        value: [],
        defaultValue: "",
        appId: "123",
      },
    ];

    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container");

    const textarea = container.querySelector('textarea[name="feedback"]');

    expect(textarea).not.toBeNull();
    expect(textarea?.getAttribute("rows")).toBe("3");
  });

  test("should generate a form with a number input field for NUMBER type", () => {
    const questions: NativeQuestion[] = [
      {
        id: "4",
        title: "Age",
        type: FEEDBACKAPPANSWERTYPE.NUMBER,
        ref: "age",
        require: true,
        external_id: "123",
        value: ["18", "25", "30"],
        defaultValue: "18",
        appId: "456",
      },
    ];

    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container");

    const numberInput = container.querySelector('input[name="age"]');

    expect(numberInput).not.toBeNull();
    expect(numberInput?.getAttribute("type")).toBe("number");
    expect(numberInput?.getAttribute("min")).toBe("18");
    expect(numberInput?.getAttribute("max")).toBe("30");
    expect((numberInput as HTMLInputElement)?.value).toBe("18");
  });

  test("should generate a form with radio buttons for RADIO type", () => {
    const questions: NativeQuestion[] = [
      {
        id: "5",
        title: "Gender",
        type: FEEDBACKAPPANSWERTYPE.RADIO,
        ref: "gender",
        require: true,
        external_id: "789",
        value: ["Male", "Female"],
        defaultValue: "Male",
        appId: "123",
      },
    ];

    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container");

    const radioButtons = container.querySelectorAll('input[name="gender"]');
    const maleRadioButton = container.querySelector(
      'input[name="gender"][value="Male"]'
    );
    const femaleRadioButton = container.querySelector(
      'input[name="gender"][value="Female"]'
    );

    expect(radioButtons.length).toBe(2);
    expect(maleRadioButton).not.toBeNull();
    expect(femaleRadioButton).not.toBeNull();
    expect(maleRadioButton?.getAttribute("type")).toBe("radio");
    expect(femaleRadioButton?.getAttribute("type")).toBe("radio");
    //expect(maleRadioButton?.checked).toBe(true);
  });

  test("should generate a form with checkboxes for MULTIPLECHOICE type", () => {
    const questions: NativeQuestion[] = [
      {
        id: "6",
        title: "Hobbies",
        type: FEEDBACKAPPANSWERTYPE.MULTIPLECHOICE,
        ref: "hobbies",
        require: true,
        external_id: "123",
        value: ["Reading", "Gaming", "Sports"],
        defaultValue: "",
        appId: "456",
      },
    ];

    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container");

    const checkboxes = container.querySelectorAll('input[name="hobbies"]');
    const readingCheckbox = container.querySelector(
      'input[name="hobbies"][value="Reading"]'
    );
    const gamingCheckbox = container.querySelector(
      'input[name="hobbies"][value="Gaming"]'
    );
    const sportsCheckbox = container.querySelector(
      'input[name="hobbies"][value="Sports"]'
    );

    expect(checkboxes.length).toBe(3);
    expect(readingCheckbox).not.toBeNull();
    expect(gamingCheckbox).not.toBeNull();
    expect(sportsCheckbox).not.toBeNull();
    expect(readingCheckbox?.getAttribute("type")).toBe("checkbox");
    expect(gamingCheckbox?.getAttribute("type")).toBe("checkbox");
    expect(sportsCheckbox?.getAttribute("type")).toBe("checkbox");
    //expect(readingCheckbox?.checked).toBe(false);
    //expect(gamingCheckbox?.checked).toBe(false);
    //expect(sportsCheckbox?.checked).toBe(false);
  });

  /**
   *
   */
  test("should generate a form with a select dropdown for SELECT type", () => {
    const questions: NativeQuestion[] = [
      {
        id: "7",
        title: "Country",
        type: FEEDBACKAPPANSWERTYPE.SELECT,
        ref: "country",
        require: true,
        external_id: "789",
        value: ["USA", "Canada", "UK"],
        defaultValue: "Canada",
        appId: "123",
      },
    ];

    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container");

    const select = container.querySelector('select[name="country"]');
    const options = container.querySelectorAll('select[name="country"] option');

    expect(select).not.toBeNull();
    expect(options.length).toBe(3);
    expect((options[0] as HTMLInputElement).value).toBe("USA");
    expect((options[1] as HTMLInputElement).value).toBe("Canada");
    expect((options[2] as HTMLInputElement).value).toBe("UK");
    //expect(options[1].selected).toBe(true);
  });

  /**
   *
   */
  test("should generate a form with a date input field for DATE type", () => {
    const questions: NativeQuestion[] = [
      {
        id: "8",
        title: "Date of Birth",
        type: FEEDBACKAPPANSWERTYPE.DATE,
        ref: "dob",
        require: true,
        external_id: "123",
        value: [],
        defaultValue: "",
        appId: "456",
      },
    ];

    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container");

    const dateInput = container.querySelector('input[name="dob"]');

    expect(dateInput).not.toBeNull();
    expect(dateInput?.getAttribute("type")).toBe("date");
  });

  /**
   *
   */
  test("should generate a form with a checkbox for BOOLEAN type", () => {
    const questions: NativeQuestion[] = [
      {
        id: "9",
        title: "Agree to Terms",
        type: FEEDBACKAPPANSWERTYPE.BOOLEAN,
        ref: "agree",
        require: true,
        external_id: "789",
        value: [],
        defaultValue: "",
        appId: "123",
      },
    ];

    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container");

    const checkbox = container.querySelector('input[name="agree"]');

    expect(checkbox).not.toBeNull();
    expect(checkbox?.getAttribute("type")).toBe("checkbox");
  });

  /**
   *
   */
  test("should generate a form without a submit button when `addButton` option is false", () => {
    const questions: NativeQuestion[] = [
      // Define your questions here
    ];

    const form = new Form(new Config(), "app-id");
    form["generateForm"]("app-id", questions, "form-container", {
      addButton: false,
    });

    const submitButton = container.querySelector(".magicfeedback-submit");

    expect(submitButton).toBeNull();
  });

  /**
   *
   */
  /*test("should add custom event listeners for beforeSubmitEvent and afterSubmitEvent", () => {
    const questions: NativeQuestion[] = [
      // Define your questions here
    ];

    const mockBeforeSubmitEvent = jest.fn();
    const mockAfterSubmitEvent = jest.fn();

    generateForm("app-id", questions, "form-container", {
      beforeSubmitEvent: mockBeforeSubmitEvent,
      afterSubmitEvent: mockAfterSubmitEvent,
    });

    const form = container.querySelector(".magicfeedback-form");

    form?.dispatchEvent(new Event("submit"));

    expect(mockBeforeSubmitEvent).toHaveBeenCalledTimes(1);
    expect(mockAfterSubmitEvent).toHaveBeenCalledTimes(1);
  });

  /**
   * 
   */
  test("should log an error message when the specified selector is not found", () => {
    const questions: NativeQuestion[] = [
      // Define your questions here
    ];

    console.error = jest.fn(); // Mock console.error method

    const appId = "nonexistent-app-id";
    const form = new Form(new Config(), appId);
    form["generateForm"]("app-id", questions, "nonexistent-container");

    expect(console.error).toHaveBeenCalledWith(
      "[MagicFeedback]:",
      "Element with ID 'nonexistent-container' not found."
    );
  });
});

/**
 * Form.answer
 */
describe("Form.answer", () => {
  /**
   *
   */
  test("should return an array of NativeAnswer objects with correct values for checked inputs", () => {
    document.body.innerHTML = `
      <form id="magicfeedback-app-id">
        <input type="text" class="magicfeedback-input" name="input1" value="Answer 1">
        <input type="radio" class="magicfeedback-input" name="input2" value="Option 1">
        <input type="radio" class="magicfeedback-input" name="input2" value="Option 2" checked>
        <input type="checkbox" class="magicfeedback-input" name="input3" value="Option A" checked>
        <input type="checkbox" class="magicfeedback-input" name="input3" value="Option B">
      </form>
    `;

    const appId = "app-id";
    const expectedAnswers = [
      { id: "input1", type: "text", value: ["Answer 1"] },
      { id: "input2", type: "radio", value: ["Option 2"] },
      { id: "input3", type: "checkbox", value: ["Option A"] },
    ];

    const form = new Form(new Config(), appId);
    const answers = form.answer();
    expect(answers).toEqual(expectedAnswers);
  });

  /**
   *
   */
  test("should return an empty array if the form with the specified ID is not found", () => {
    document.body.innerHTML = "";

    const appId = "nonexistent-app-id";

    const form = new Form(new Config(), appId);
    const answers = form.answer();

    expect(answers).toEqual([]);
  });

  /**
   *
   */
  test("should return an empty array if no inputs are present in the form", () => {
    document.body.innerHTML = `
      <form id="magicfeedback-app-id"></form>
    `;

    const appId = "app-id";

    const form = new Form(new Config(), appId);
    const answers = form.answer();

    expect(answers).toEqual([]);
  });

  /**
   *
   */
  test("should handle multiple inputs with the same name correctly", () => {
    document.body.innerHTML = `
      <form id="magicfeedback-app-id">
        <input type="checkbox" class="magicfeedback-input" name="input1" value="Option A" checked>
        <input type="checkbox" class="magicfeedback-input" name="input1" value="Option B" checked>
        <input type="checkbox" class="magicfeedback-input" name="input1" value="Option C">
      </form>
    `;

    const appId = "app-id";
    const expectedAnswers = [
      { id: "input1", type: "checkbox", value: ["Option A"] },
      { id: "input1", type: "checkbox", value: ["Option B"] },
    ];

    const form = new Form(new Config(), appId);
    const answers = form.answer();

    expect(answers).toEqual(expectedAnswers);
  });

  /**
   * Form.send
   */
  describe("Form.send", () => {
    /*beforeEach(() => {
      // Mock the fetch function
      jest.spyOn(global, "fetch").mockResolvedValueOnce({
        "ok": true,
        "status": 200,
        "statusText": "OK",
        //"json": jest.fn().mockResolvedValueOnce({}),
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should send survey answers successfully", async () => {
      const appId = "nonexistent-app-id";
      const form = new Form(new Config(), appId);

      // Mock the answer() function to return sample survey answers
      form.answer = jest.fn(() => [
        {
          id: "question1",
          type: "checkbox",
          value: ["option1", "option2"],
        },
        {
          id: "question2",
          type: "radio",
          value: ["option3"],
        },
      ]);

      // Call the send() function
      await form.send();

      // Check if fetch() was called with the correct arguments
      expect(fetch).toHaveBeenCalledWith("https://example.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            id: "question1",
            type: "checkbox",
            value: ["option1", "option2"],
          },
          {
            id: "question2",
            type: "radio",
            value: ["option3"],
          },
        ]),
      });

      // Add additional assertions as needed
    });

    test("should handle error response when sending survey answers", async () => {
      const appId = "nonexistent-app-id";
      const form = new Form(new Config(), appId);

      // Mock the answer() function to return sample survey answers
      form.answer = jest.fn(() => [
        {
          id: "question1",
          type: "text",
          value: ["answer1"],
        },
      ]);

      // Mock the fetch function to return an error response
      jest.spyOn(global, "fetch").mockResolvedValueOnce({
        "ok": false,
        "status": 500,
        "statusText": "Internal Server Error",
      });

      // Call the send() function
      await form.send();

      // Check if fetch() was called with the correct arguments
      expect(fetch).toHaveBeenCalledWith("https://example.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            id: "question1",
            type: "text",
            value: ["answer1"],
          },
        ]),
      });

      // Check if appropriate error handling logic is implemented
      // For example, you can assert that an error message is logged or specific error handling actions are taken

      // Add additional assertions as needed
    });*/
  });
});
