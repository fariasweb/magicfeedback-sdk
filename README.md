# MagicFeedbackAI SDK

MagicFeedbackAI JavaScript Library for [MagicFeedback.io](https://magicfeedback.io/)

## Install

This library is available as a [package on NPM](https://www.npmjs.com/package/@magicfeedback/native). To install into a project using NPM with a front-end packager such as [Browserify](http://browserify.org/) or [Webpack](https://webpack.github.io/):

```sh
npm i @magicfeedback/native
```

You can then require the lib like a standard Node.js module:

```javascript
var magicfeedback = require("@magicfeedback/native");

// or

import magicfeedback from "@magicfeedback/native";

```

## Init

This method is optional. You can start actived the debug mode to see on console the messages

```javascript
magicfeedback.init({
    debug: true | false // Default false
})

```

## How to use
This guide provides instructions for utilizing various features and functionalities of the application. Each section below highlights a specific use case and provides a code snippet to demonstrate its implementation.

### A. Send feedback
This code snippet demonstrates how to collect and send user feedback to the server. Before executing the code, make sure to follow the instructions below:

1. Set up the necessary dependencies, including the magicfeedback library.
2. Obtain the App Id required for sending feedback to the server. Replace `$_APP_ID` with your specific App Id.
3. Customize the answers array with the desired feedback questions and corresponding user responses.
4. Optionally, modify the profile object to include any additional information you want to collect from the user.
5. Execute the magicfeedback.send() function, passing in the App Id, answers array, and profile object as parameters.


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
