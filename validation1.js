function Validation(idTarget) {
    let _this = this;
    let formRules = {};
    let rules = {
        required: function (value) {
            if (!value) {
                return "Vui lòng nhập dữ liệu cho trường này!";
            }
            return value ? undefined : "Vui lòng nhập dữ liệu cho trường này!";
        },
        email: function (value) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value) ? undefined : "Vui lòng nhập đúng email!";
        },
        minPassword: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập khẩu có it nhất ${min} ký tự!`;
            }
        },
        rePassword: function (value, temp) {
            return value == temp ? undefined : "Nhập lại mật khẩu không chính xác!";
        }

    }
    let fomrElement = document.querySelector(idTarget);
    if (fomrElement) {
        let inputs = document.querySelectorAll("[name][rules]");
        for (let input of inputs) {
            formRules[input.name] = input.getAttribute("rules");
            let ruleElements = input.getAttribute("rules").split("|");
            for (let ruleItem of ruleElements) {
                let rulePresent = rules[ruleItem];
                if (ruleItem.includes(":")) {
                    let ruleItemHasSign = ruleItem.split(":");
                    rulePresent = rules[ruleItemHasSign[0]](ruleItemHasSign[1]);
                }
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(rulePresent);
                } else {
                    formRules[input.name] = [rulePresent];
                }
            }
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
    }
    function getParent(element, target) {
        return element.closest(target);
    }

    function checkError(event) {
        let errorMessage;
        let rules = formRules[event.target.name];

        rules.find(function (rule) {
            if (rule.name == "rePassword") {
                let temp = getParent(event.target, ".form").querySelector("#password").value;
                errorMessage = rule(event.target.value, temp);
            } else {
                if (event.target.type == "checkbox" || event.target.type == "radio") {
                    if (getParent(event.target, ".form-input").querySelector("input[name=" + `${event.target.name}` + "]:checked") != null) {
                        errorMessage = rule(getParent(event.target, ".form-input").querySelector("input[name=" + `${event.target.name}` + "]:checked").value);
                    } else {
                        errorMessage = rule("");
                    }
                } else {
                    errorMessage = rule(event.target.value);
                }
            }
            return errorMessage;
        });
        return errorMessage;
    }

    function handleValidate(event) {
        let errorMessage = checkError(event);
        if (errorMessage) {
            let formInput = getParent(event.target, ".form-input");
            if (formInput) {
                event.target.classList.add("invalid");
                formInput.querySelector(".form-noti").innerHTML = errorMessage;
            }
        }
    }
    function handleClearError(event) {
        let formInput = getParent(event.target, ".form-input");
        if (formInput) {
            formInput.querySelector(".form-noti").innerHTML = "";
            event.target.classList.remove("invalid");
        }

        let check = formInput.querySelector(".fa-check");
        if (check) {
            let errorMessage = checkError(event);
            if (!errorMessage) {
                check.classList.remove("none");
            } else {
                check.classList.add("none");
            }
        }
    }

    fomrElement.onsubmit = function (event) {
        event.preventDefault();

        let inputs = document.querySelectorAll("[name][rules]");
        let formValid = true;
        for (let input of inputs) {
            handleValidate({ target: input });
            if (checkError({ target: input })) {
                formValid = false;
            }
        }
        if (formValid) {
            let valuesInput = Array.from(inputs).reduce(function (result, input) {
                switch (input.type) {

                    case "radio": {
                        if (document.querySelector("input[name=" + `${input.name}` + "]:checked") != null) {
                            result[input.name] = document.querySelector("input[name=" + `${input.name}` + "]:checked").value;
                        } else {
                            result[input.name] = {};
                        }
                    } break;
                    case "checkbox": {
                        if (!input.matches(":checked")) {
                            return result;
                        }
                        if (!Array.isArray(result[input.name])) {
                            result[input.name] = [];
                        }
                        result[input.name].push(input.value);
                    } break;
                    case "file": {
                        result[input.name] = input.files;
                    } break;
                    default: {
                        result[input.name] = input.value;
                    }
                }
                return result;
            }, {});
            _this.onSubmit(valuesInput);
        }
    }
}