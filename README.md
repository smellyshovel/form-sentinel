# Form Sentinel
Inspired by Ruby On Rails ActiveRecord Validations *Form Sentinel* allows you to
painlessly define validation constraints for your forms and easily validate them
just by specifying what and when to validate and then catching the `validation`
event and working with its properties.

The main principles of the *Form Sentinel* are the explicit and concise description
of the validation constraints, the ability to simply bind certain checks to certain
events that occur with the form (and not only the form), and the ability to work
with the validation event asynchronously.

*Form Sentinel* is written using Vanilla JavaScript and has **no dependencies**.

## Installation
Currently there are **two** possible ways to install Form Sentinel:

1. Just download the desired version, unpack it to your project's folder and add
the `<script src>` tag (pointing to `src/form-sentinel.js`) to the HTML file.

1. Install via `[bower](http://bower.io)`:

    ```shell
    $ bower install form-sentinel
    ```
    Or
    ```shell
    $ bower install form-sentinel -S
    ```
    to add Form Sentinel to your dependencies list.

## Usage
**First of all** you should create a variable which contains a link to your form
element:
```javascript
let form = document.querySelector("#myForm");
```

**Then** add the `validationRules` property to your `form` and make it equal to
the object, that contains validation constraints for this `form`:
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
You can find out more about `validationRules` property [here](https://github.com/smellyshovel/form-sentinel/wiki/Working-with-the-validationRules-property).

The **third** thing you should do is set the `validateOn` property of the `form`
corresponding to your vision of which validations of which fields should happen
on defenite events ongoing with the `form`:
```javascript
form.validateOn = ["submit", {
    keyup: {name: ["presence"]}
}];
```
You can find out more about `validateOn` property [here](https://github.com/smellyshovel/form-sentinel/wiki/Working-with-the-validateOn-property).

The **last** thing is to add the validation event listener to the `form` and
handle results of validation:
```javascript
form.addEventListener("validation", function(event) {
    if (event.detail.validation.passed) {
        // do something with form.correctedFields
    } else if (event.detail.validation.failed) {
        // do something with form.fieldsWithErrors
    }
});
```
You can find out more about `validation event` [here](#).

After that you can work with `fieldsWithErrors` and `correctedFields` properties
of the `form`. As simple as that!

## Details
All the details of Usage can be found in the
[Wiki](https://github.com/smellyshovel/form-sentinel/wiki) of the project.

## Contribution
I'm open to any kind of contribution you can offer, especially to your new bright
ideas and making the code better. Don't be shy :+1:!
