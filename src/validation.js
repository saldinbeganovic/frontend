import { extend } from "vee-validate";
import { required } from "vee-validate/dist/rules";
import { formatDate } from "@/utils/utils";

extend("email", {
  validate(value) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase());
  },
  message(fieldName) {
    return `The ${fieldName} must be in valid email.`;
  }
});

extend("website", {
  validate(value) {
    const re = /^http(s)?:(www\.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)|http(s)?:\/\/?(www\.)?(?!ww)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
    return re.test(String(value));
  },
  message(fieldName) {
    return `The ${fieldName} must be a valid website.`;
  }
});

extend("phone-number", {
  validate(value) {
    const re = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return re.test(value);
  },
  message(fieldName) {
    return `The ${fieldName} must be a valid phone number.`;
  }
});
extend("deadline", {
  validate(value) {
    const currDate = new Date();
    const deadlineDate = new Date(value);
    return currDate < deadlineDate;
  },
  message(fieldName) {
    return `The ${fieldName} must not be in the past.`;
  }
});
//validate if printing date is in the past or on the same day as decorating date
extend("after-print-date", {
  validate(value, args) {
    if (args.printDate != "null" && args.printDate != "undefined") {
      const printDate = new Date(args.printDate);
      const deadlineDate = new Date(value);
      return deadlineDate >= printDate;
    }
    return true;
  },
  params: ["printDate"],
  message(fieldName, args) {
    return `The ${fieldName} must be after this date (${formatDate(
      args.printDate
    )}).`;
  }
});

extend("required", required);
