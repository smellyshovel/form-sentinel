# Form Sentinel
Form Sentinel allows you to validate the forms on your page fast and painless. Just describe validation constraints that you wish your form
to correspond to, specify when a validation should happen (or even when and which ones on which fields should happen), then add the
validation event listener to your form and handle results!

## Installation
Currently there are **two** possible ways to install Form Sentinel:

1. Just download the version you prefer and add it to your project folder
1. Install via `bower`
    ```shell
    $ bower install form-sentinel
    ```
    Or
    ```shell
    $ bower install form-sentinel -S
    ```
    to add Form Sentinel to your dependencies list.

## Usage
**First of all** you should create a variable which contains a link to your form element.
```javascript
let form = document.querySelector("#myForm");
```

**Then** you should add `validationRules` property to your form object and make it equal to the object,
that contains validation constraints for the definite form. For example:
```javascript
form.validationRules = {
    name: {
        presense: [true, {trim: true}],
        length: {maximum: 24},
        messages: {
            presense: "must be filled",
            length: "maximum length is 24 characters"
        }
    }
}
```
You can find out more about *validationRules* property [here](#).

The **third** thing you should do is specify cases of when you want a validation to happen, like this:
```javascript
form.validateOn = ["submit", {
    keyup: {name: ["presence"]}
}];
```
You can find out more about *validateOn* property [here](#).

The **last** thing is to add the validation event listener and handle results of validation:
```javascript
form.addEventListener("validation", function(event) {
    if (event.detail.validation.passed) {
        // do something with form.correctedFields
    } else if (event.detail.validation.failed) {
        // do something with form.fieldsWithErrors
    }
});
```
You can find out more about *validation event* [here](#).
