# MagicFeedbackAI SDK

MagicFeedback AI JavaScript Library for [MagicFeedback.io](https://magicfeedback.io/)

## Install

This library is available as a [package on NPM](https://www.npmjs.com/package/@magicfeedback/native). To install into a project using NPM with a front-end packager such as [Browserify](http://browserify.org/) or [Webpack](https://webpack.github.io/):

```sh
npm i @magicfeedback/native
```

You can then require the lib like a standard Node.js module:

```js
var magicfeedback = require("@magicfeedback/native");

// or

import magicfeedback from "@magicfeedback/native";

```

## Init

This method is optional. You can start actived the debug mode to see on console the messages

```js
magicfeedback.init({
    debug: true | false // Default false
})

```

## How to use
This guide provides instructions for utilizing various features and functionalities of the application. Each section below highlights a specific use case and provides a code snippet to demonstrate its implementation.

### A. Generate feedback forms
The feedback form generation functionality allows you to easily create and display feedback forms on your website. This section provides an overview of how to use this feature and the necessary code snippets.

To generate a feedback form, you need to include the following HTML code snippet in your web page:

```html
<div id="demo_form_div"></div>
```
This code snippet creates a placeholder element with the ID "demo_form_div" where the feedback form will be inserted.

Next, you need to include the following JavaScript code snippet in your application:

```js
let form = window.magicfeedback.form("$_APP_ID");
form.generate("demo_form_div", {
    addButton: true | false // Default false
    beforeSubmitEvent: function(), //Function to execute before send the form
    afterSubmitEvent: function(response), //Function to execute after send the form with the response
})
```

In this code snippet, you need to replace $_APP_ID with the actual ID of your feedback application. This ID is provided by the magicfeedback service.


The **form.generate()** function generates the feedback form inside the specified container element ("demo_form_div" in this example). You can customize the form generation by including the optional parameters:

* **addButton**: This setting determines whether to include a "Submit" button that enables users to submit the form themselves. By default, this value is set to false, indicating that the button will not be displayed.
* **beforeSubmitEvent**: An optional function that you can define to execute some actions or validations before the form is submitted.
* **afterSubmitEvent**: An optional function that you can define to execute actions after the form is submitted. This function receives the server response as a parameter.

Finally, to send the form, you can use the form.send() function.

```js
form.send()
```

This function triggers the submission of the generated feedback form.

![](./public/A_form.png)

By following these steps and including the appropriate HTML and JavaScript code snippets, you can easily generate and display feedback forms on your website using the magicfeedback service.

### B. Send feedback directly
The "Send feedback directly" functionality allows you to send user feedback data to the server without generating a feedback form. This section provides an overview of how to use this feature and the necessary code snippets.

To send feedback directly, you need to include the following JavaScript code snippet in your application:


```js

// Initialize an empty array to store user feedback answers
const answers = [];

// Add user feedback answer objects to the 'answers' array
// Each answer object should have a 'id' key (string) and a 'value' key (array of string values)
answers.push({ id: "rating", value: ["Ok"] });
answers.push({ id: "improve", value: ["Maybe the interface is a bit slow on my OSX"] });

// Create a profile object to store additional information
// You can include any information you want in this object
const profile = { email: "farias@magicfeedback.io" };

// Send the user feedback data to the server
// Make sure to provide the required App Id as a parameter
magicfeedback.send("$_APP_ID", answers, profile);

```

In this code snippet, you need to replace $_APP_ID with the actual ID of your feedback application. This ID is provided by the magicfeedback service.

The answers array stores user feedback answer objects. Each answer object should have an id key, which represents the question or feedback category, and a value key, which holds an array of string values representing the user's response(s) to that question or category. You can add as many answer objects as needed to capture the user's feedback.

Additionally, you can create a profile object to store additional information about the user. This object can include any information you want, such as the user's email, name, or any other relevant details.

Finally, to send the user feedback data to the server, you can use the magicfeedback.send() function. This function takes three parameters: the App Id, the answers array, and the profile object. The App Id is required and identifies your feedback application within the magicfeedback service.

By following these steps and including the appropriate JavaScript code snippet, you can send user feedback data directly to the server using the magicfeedback service.
