# MagicFeedbackAI SDK

MagicFeedback AI JavaScript Library for [MagicFeedback.io](https://magicfeedback.io/)

## Install

This library is available as a [package on NPM](https://www.npmjs.com/package/@magicfeedback/native). To install into a
project using NPM with a front-end packager such as [Browserify](http://browserify.org/)
or [Webpack](https://webpack.github.io/):

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

This guide provides instructions for utilizing various features and functionalities of the application. Each section
below highlights a specific use case and provides a code snippet to demonstrate its implementation.

### A. Generate feedback forms

The feedback form generation functionality allows you to easily create and display feedback forms on your website. This
section provides an overview of how to use this feature and the necessary code snippets.

To generate a feedback form, you need to include the following HTML code snippet in your web page:

```html

<div id="demo_form_div"></div>
```

This code snippet creates a placeholder element with the ID "demo_form_div" where the feedback form will be inserted.

Next, you need to include the following JavaScript code snippet in your application:

```js
let form = window.magicfeedback.form(
    "$_APP_ID",
    "$_PUBLIC_KEY"
);

form.generate(
    "demo_form_div",
    {
        addButton: true | false // Default false
        beforeSubmitEvent: function (), //Function to execute before send the form
        afterSubmitEvent: function (response), //Function to execute after send the form with the response
    }
)
```

In this code snippet, you need to replace $_APP_ID with the actual ID of your feedback application. This ID is provided
by the magicfeedback service.

The **form.generate()** function generates the feedback form inside the specified container element ("demo_form_div" in
this example). You can customize the form generation by including the optional parameters:

* **addButton**: This setting determines whether to include a "Submit" button that enables users to submit the form
  themselves. By default, this value is set to false, indicating that the button will not be displayed.
* **beforeSubmitEvent**: An optional function that you can define to execute some actions or validations before the form
  is submitted.
* **afterSubmitEvent**: An optional function that you can define to execute actions after the form is submitted. This
  function receives the server response as a parameter.

Finally, to send the form, you can use the form.send() function.

```js
form.send()
```

This function triggers the submission of the generated feedback form.

![](./public/A_form.png)

By following these steps and including the appropriate HTML and JavaScript code snippets, you can easily generate and
display feedback forms on your website using the magicfeedback service.

### B. Send feedback directly

With this option you can send feedback directly without generate a form. This section provides an overview of how to use
this feature and the necessary code snippets.

To send feedback directly, you need to include the following JavaScript code snippet in your application:

```js 
window.magicfeedback.send(
    "$_APP_ID",
    "$_PUBLIC_KEY",
    feedbackData,
    completed, // Default true
    "$_ID", // Optional
    "$_PRIVATE_KEY", // Optional
)
```

In this code snippet, you need to replace $_APP_ID with the actual ID of your feedback application and the $_PUBLIC_KEY
with the public key of your feedback application. This ID and key is provided by the magicfeedback service. 

###### FeedbackData
Then, you can include the feedback data in an object with the following structure:

    {
        text: "string", // Optional
        answers: [
            {
                key: 'string',
                value: ["string"]
            },
        ],
        metadata: [
            {
                key: 'string',
                value: "string"
            },
        ],
        metrics: [
            {
                key: 'string',
                value: "string"
            },
        ],
        profile: [
            {
                key: 'string',
                value: "string"
            },
        ],
    }

* **key**: This setting determines the key of the feedback data.
* **value**: This setting determines the value of the feedback data.

Not all the fields are required. You can send only the fields that you need. But you need to send one of that minimal.

Finally, to send the feedback, you can use the magicfeedback.send() function.
