# MagicFeedbackAI SDK Changelog

This document outlines the changes and updates made to the [@magicfeedback/native](https://www.npmjs.com/package/@magicfeedback/native) JS SDK.

We recommend keeping your SDK up-to-date to benefit from the latest features, bug fixes, and security improvements.

Please refer to the specific version number for detailed information.

## 🚀 [1.2.4] - 2024-06-11
### New Features
- Added dynamic conditional options:
  - Finish conditional: A new option that allows users to finish the feedback flow based on a condition.
  - Skip conditional: A new option that allows users to skip a question based on a condition.
  - Redirect conditional: A new option that allows users to redirect to a specific question based on a condition.
- Get default values by params: new possibility to get the default values of the feedback by params.

## 🚀 [1.1.16] - 2024-04-26
- Added image in inputs, now you can add images in the feedback inputs to make it more interactive.
- Added new widget logic to increase the flexibility of the feedback flow
- New widgets: Added a new widget type:
    - Multiple choice image: A widget that allows users to select multiple image options from a list.
    - Contact form: A widget that allows users to submit their contact information.
    - Yes/No: A widget that allows users to answer a yes/no question.
- Fixed bugs:
    - Resolved a bug with stars rating widget on save data 


## 🚀 [1.1.15] - 2024-03-26

### New Features
- Users can now customize the text of various UI elements within the feedback widget:
  - Metadata: Added the ability to pass metadata to the feedback widget. This metadata will be included in the feedback submission.
- New widgets: Added a new widget type:
    - Rating emoji 0-10: A widget that allows users to rate their experience using emojis.
    - Rating emoji 1-5: A widget that allows users to rate their experience using emojis.
    - Rating stars 1-5: A widget that allows users to rate their experience using stars.
    - Rating numbers 0-10: A widget that allows users to rate their experience using numbers.
    - Rating numbers 1-5: A widget that allows users to rate their experience using numbers.

## 🚀 [1.1.13] - 2024-03-08

### New Features
- Users can now customize the text of various UI elements within the feedback widget:
    - Send button
    - Back button
    - Next button
    - Success message
- Additionally, the success screen can be disabled entirely, allowing for more flexibility in the feedback flow.
- Question Format: Introduced a "slim" question format where the label is displayed as a placeholder within the input field.
- Boolean Option Styling: A new special class can be applied to boolean options to position the label on the right side.

### Bug Fixes:
- Resolved several bugs that were identified during initial development. (For detailed information on specific bug fixes, consider adding a link to an issue tracker if applicable)
