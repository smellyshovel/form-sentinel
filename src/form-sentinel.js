class SingleValidation {
    constructor(field, rules) {
        this.field = field;
        this.rules = rules;
    }

    presence(presence, message = "can't be blank") {
        let value = this.field.value;
        if (presence instanceof Array) {
            value = presence[1].trim ? value.trim() : value;
            presence = presence[0];
        }

        if (presence === true) {
            if (value.length === 0) return message;
        }
    }

    absence(absence, message = "must be blank") {
        let value = this.field.value;
        if (absence instanceof Array) {
            value = absence[1].trim ? value.trim() : value;
            absence = absence[0];
        }

        if (absence === true) {
            if (value.length !== 0) return message;
        }
    }

    length(length, message) {
        let value = this.field.value;
        if (length.trim === true) value.trim();

        if (length.is) {
            if (value.length !== length.is) return message ||
            `must be ${length.is} characters long`;
        } else if (length.minimum || length.maximum) {
            if (value.length < length.minimum || value.length > length.maximum) return message ||
            `minimal length is ${length.minimum || 0} and maximum length is ${length.maximum || Infinity}`;
        } else if (length.in) { // may not need this irl
            if (length.in instanceof Array) {
                if (value.length < length.in[0] || value.length > length.in[1]) return message ||
                `must be between ${length.in[0]} and ${length.in[1]} characters long`;
            }
        }
    }

    numericality(numericality, message = "must be numeric") {
        if (numericality === true) {
            if (!(!isNaN(parseFloat(this.field.value)) && isFinite(this.field.value))) return message;
        } else {
            if (!isNaN(parseFloat(this.field.value)) && isFinite(this.field.value)) return message;
        }
    }

    confirms(confirms, message) {
        let target = document.querySelector(`[name="${confirms}"]`);
        if (this.field.value !== target.value) return message ||
        `must be equal to ${target.name}`;
    }

    format(format, message = "is invalid") {
        if (format.with) {
            if (this.field.value.search(format.with) === -1) return message;
        } else if (format.without) {
            if (~this.field.value.search(format.without)) return message;
        }
    }
}

class MultipleValidation {
    constructor(fieldSet, rules) {
        this.fieldSet = fieldSet;
        this.rules = rules;
    }

    checked(checked, message) {
        if (checked === "some") {
            if (!this.fieldSet.some((field) => {
                return field.checked;
            })) return message || "something must be selected";
        } else if (checked === "every") {
            if (this.fieldsSet[0].type="checkbox") {
                if (!this.fieldSet.every((field) => {
                    return field.checked;
                })) return message || "every box must be selected";
            }
        } else if (checked === "none") {
            if (this.fieldSet.some((field) => {
                return field.checked;
            })) return message || "nothing might be selected";
        } else if (checked.value) {
            if (checked.only === true) {
                let checkedField = this.fieldSet.find((field) => {
                    return field.checked;
                });

                if (!checkedField || checkedField.value !== checked.value) return message ||
                "only definite box must be selected";
            } else {
                let checkedFields = this.fieldSet.filter((field) => {
                    return field.checked;
                });

                if (!checkedFields.some((field) => {
                    return field.value === checked.value;
                })) return message || "at least definite box must be selected";
            }
        }
    }
}

class Validation {
    constructor(form) {
        this.form = form;
    }

    static validate(_this) {
        return Object.keys(_this.rules).map((rule) => {
            if (rule.toString() != "messages") {
                return _this[rule.toString()](
                    _this.rules[rule.toString()],
                    _this.rules.messages ? _this.rules.messages[rule.toString()] : undefined
                );
            }
        }).filter((error) => {
            return error !== undefined;
        });
    }

    validateSingle(field, rules) {
        let v = new SingleValidation(field, rules);
        let errors = Validation.validate(v);

        if (errors.length > 0) {
            field.validationErrors = errors;
        } else {
            if (~this.form.fieldsWithErrors.indexOf(field)) {
                field.validationErrors = null;
            }
        }
    }

    validateMultiple(fieldSet, rules) {
        let v = new MultipleValidation(fieldSet, rules);
        let errors = Validation.validate(v);

        if (errors.length > 0) {
            fieldSet[0].validationErrors = errors;
        } else {
            if (this.form.fieldsWithErrors.indexOf(fieldSet[0]) != -1) {
                fieldSet[0].validationErrors = null;
            }
        }
    }

    validateFields(fields, certainRules) {
        if (fields instanceof Array) {
            fields.forEach((fieldSet) => {
                if (fieldSet.length == 1) {
                    let field = fieldSet[0];
                    this.validateSingle(field, this.form.validationRules[field.name]);
                } else if (fieldSet.length > 1) {
                    this.validateMultiple(fieldSet, this.form.validationRules[fieldSet[0].name]);
                }
            });
        } else if (fields instanceof HTMLElement) {
            // assuming that `fields` is single HTMLElement
            this.validateSingle(fields, certainRules || this.form.validationRules[fields.name]);
        }

        this.passed = (this.form.fieldsWithErrors.length == 0);
        this.failed = !!!this.passed;
    }

    static get format() {
        return {
            email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        }
    }
}

// DONE: disableBrowserValidations
HTMLFormElement.prototype.disableBrowserValidations = function () {
    this.setAttribute("novalidate", "");
};

HTMLFormElement.prototype.registerBeforeValidationEvent = function (toggledBy, fields) {
    if (fields instanceof Array) {
        var flattened = fields.reduce(function(prev, curr) {
            return prev.concat(curr);
        });
    } else if (fields instanceof HTMLElement) {
        var flattened = [fields];
    }

    return new CustomEvent("beforeValidation", {detail: {
        eventType: toggledBy,
        fieldsToValidate: flattened
    }});
};

HTMLFormElement.prototype.registerValidationEvent = function (toggledBy, validation) {
    return new CustomEvent("validation", {detail: {
        toggledBy: toggledBy,
        validation: validation
    }});
};

HTMLFormElement.prototype.addEventListeners = function (events, callback) {
    if (!events || events.length < 1) return false; // TODO: why is this here?

    let availableGlobalEvents = ["submit", "change", "blur", "keyup"];
    let globalEvents = events.filter((event) => {
        return typeof event === "string" && ~availableGlobalEvents.indexOf(event);
    });

    let attachedGlobalEvents = [];
    globalEvents.forEach((event) => {
        if (attachedGlobalEvents.indexOf(event) === -1) {
            if (event === "submit") {
                this.addEventListener(event, function(event) {
                    event.preventDefault();
                    callback(event.type, this.fieldsToCheck());
                });
            } else {
                this.fieldsToCheck(true).forEach((field) => {
                    field.addEventListener(event, function(event) {
                        callback(event.type, event.target);
                    });
                });
            }
        }

        attachedGlobalEvents.push(event);
    });

    // particular
    let particularEvents = events.find((event) => {
        return typeof event === "object";
    });

    let availableParticularEvents = ["change", "blur", "keyup"];
    let attachedParticularEvents = [];
    for (let event in particularEvents) {
        if (~availableParticularEvents.indexOf(event) && attachedParticularEvents.indexOf(event) === -1) {
            if (particularEvents[event] instanceof Array) {
                particularEvents[event].forEach((name) => {
                    let el = this.fieldsToCheck(true).find((field) => {
                        return field.name === name;
                    });

                    if (el) {
                        el.addEventListener(event, function(event) {
                            callback(event.type, el);
                        });
                    }
                });
            } else if (typeof particularEvents[event] === "object") {
                for (let name in particularEvents[event]) {
                    let field = this.fieldsToCheck(true).find((f) => {
                        return f.name === name;
                    });

                    if (field) {
                        rulesNames = particularEvents[event][name].filter((rule) => {
                            return this.validationRules[name][rule];
                        });

                        let rules = {messages: {}};
                        Object.assign(rules.messages, this.validationRules[name].messages)
                        rulesNames.forEach((ruleName) => {
                            rules[ruleName] = {};
                            Object.assign(rules[ruleName], this.validationRules[name][ruleName]);
                        });

                        field.addEventListener(event, function(event) {
                            callback(event.type, field, rules);
                        });
                    }
                }
            }
        }

        availableParticularEvents.push(event);
    }
};

Object.defineProperty(HTMLFormElement.prototype, "validateOn", {
    set: function validateOn(events) {
        this.disableBrowserValidations();

        this.addEventListeners(events, (eventType, fields, certainRules) => {
            let v = new Validation(this);

            let beforeValidationEvent = this.registerBeforeValidationEvent(eventType, fields);
            this.dispatchEvent(beforeValidationEvent);

            v.validateFields(fields, certainRules);

            let validationEvent = this.registerValidationEvent(eventType, v);
            this.dispatchEvent(validationEvent);
        });
    }
});

HTMLFormElement.prototype.validate = function (fields, callback) {
    this.disableBrowserValidations();

    let v = new Validation(this);
    v.validateFields(fields);

    callback(v);
};

Object.defineProperty(HTMLFormElement.prototype, "fieldsWithErrors", {
    get: function fieldsWithErrors() {
        return [].slice.call(this.elements).filter((field) => {
            return field.validationErrors && field.validationErrors.length > 0;
        });
    }
});

Object.defineProperty(HTMLFormElement.prototype, "correctedFields", {
    get: function correctedFields() {
        return [].slice.call(this.elements).filter((field) => {
            if (field.validationErrors === null) {
                delete field.validationErrors;
                return true;
            }
        });
    }
});

HTMLFormElement.prototype.fieldsToCheck = function (single) {
    if (single) {
        let fieldsToCheck = Object.keys(this.validationRules).map((name) => {
            let e = document.querySelector(`[name="${name}"]`);
            if (e && e.type != "checkbox" && e.type != "radio") return e;
        });

        return fieldsToCheck.filter((field) => {
            return field instanceof HTMLElement;
        });
    }

    return Object.keys(this.validationRules).map((name) => {
        return [].slice.call(document.querySelectorAll(`[name="${name}"]`));
    });
};
