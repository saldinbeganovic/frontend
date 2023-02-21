import {
  getPointsOfSale,
  getPosOfCompany
} from "@/api/admin/company/point-of-sale";
import { deep, formatDate } from "@/utils/utils";

export const globalMixin = {
  computed: {
    // for admin dashboard we need to read the companyId from url path
    // while in user dashboard companyId is static
    companyId() {
      return this.$route.params.companyId || this.$store.getters.companyId;
    },
    phoneNumberPattern() {
      return "^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$";
    },
    pathPrefix() {
      return this.$route.path.split("/")[1];
    },
    isAdminDashboard() {
      return this.$route.path.startsWith("/admin");
    },
    isManufacturerDashboard() {
      return this.$route.path.startsWith("/manufacturer");
    },
    isCompanyDashboard() {
      return this.$route.path.startsWith("/user");
    },
    userPathPrefix() {
      return this.isAdminDashboard ? "admin" : "user";
    },
    // path prefix for whole company part of the dashboard
    companyPathPrefix() {
      return this.$route.fullPath.substring(0, 5) === "/user"
        ? "user"
        : `admin/company/${this.companyId}`;
    },
    // in order to user these computed property
    // screen must have "searchQuery" and "items" fields implemented
    filteredItems() {
      // support search in nested objects§
      if (!this.searchQuery) return this.items;
      const check = q => new RegExp(`.*${this.searchQuery}.*`, "i").test(q);
      const format = (key, value) => {
        // check dates by their formatted value
        if (key === "created_at" || key === "updated_at") {
          return formatDate(value);
        }
        return value;
      };
      function filterItem(e) {
        return Object.keys(e).reduce((p, c) => {
          return p || check(format(c, e[c]));
        }, false);
      }
      function filter(items) {
        return items.filter(filterItem);
      }

      return filter(this.items);
    }
  },
  mounted() {
    // this query finds all labels of inputs mandatory inputs (with required attribute)
    // and adds a * postfix to the titles
    [
      ...document.querySelectorAll("div[role=group] input[required]"),
      ...document.querySelectorAll("div[role=group] select[required]")
    ]
      .map(e => e.parentElement.parentElement.querySelector("label"))
      .forEach(e =>
        e && e.innerText.indexOf("*") < 0
          ? (e.innerText = `${e.innerText} *`)
          : null
      );
  },
  methods: {
    scaledVideoPlayerDimensions(width, height) {
      // make sure the video component doesn't overflow screen height
      let w = 500;
      let h = 500;
      if (width > height) {
        h = (height / width) * 500;
      } else {
        w = (width / height) * 500;
      }
      // const diff = window.innerHeight - 200 - h;
      // if (diff < 0) {
      //   h += diff;
      //   w += diff;
      // }
      return [w, h];
    },
    toS3Url(path) {
      return `${process.env.VUE_APP_S3_HOST}/${path}`;
    },
    isImage(path) {
      return ["png", "jpg", "jpeg"].includes(this.fileType(path));
    },
    randomLetters(n) {
      // returns a sequence of n random upper case letters
      const randCharCode = () => Math.round(Math.random() * 25 + 65);
      return new Array(n)
        .fill(0)
        .map(() => String.fromCharCode(randCharCode()))
        .join("");
    },
    onFormatUrl(e, field) {
      const value = e.target.value.replaceAll(" ", "");
      if (value.length > 0 && value.indexOf("http") < 0) {
        this.$set(this, field, `https://${value}`);
      }
    },
    fileType(path) {
      if (path) {
        const parts = path.split(".");
        return parts[parts.length - 1];
      } else {
        return null;
      }
    },
    fileName(path) {
      const parts = path.split("/");
      return parts[parts.length - 1];
    },
    formatDate(value, withTime) {
      return formatDate(value, withTime);
    },
    formatBytes(bytes, decimals = 2) {
      if (!bytes) {
        return "-";
      }
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    },
    // if the user is admin it returns all pos of selected company
    // otherwise it returns only pos to which user is assigned
    getPos(fetchAll = false) {
      if (fetchAll && this.isAdminDashboard) {
        return getPointsOfSale();
      }
      return this.isAdminDashboard && this.$route.params.companyId
        ? getPosOfCompany(this.$route.params.companyId)
        : getPosOfCompany(this.$store.getters.companyId);
    },
    statusVariant(nActive, nInactive) {
      if (nActive === 0 && nInactive === 0) {
        return "disabled";
      }
      if (nActive === 0) {
        return "danger";
      }
      if (nInactive === 0) {
        return "success";
      }
      return "warning";
    },
    statusTitle(nActive, nInactive, noItemsMessage, msgPostfix) {
      if (nActive === 0 && nInactive === 0) {
        return noItemsMessage;
      }
      return `${nActive} / ${nInactive + nActive} ${
        msgPostfix ? msgPostfix : "online"
      }`;
    },
    parseDatetime(dateObject) {
      // parse date to YYYY-MM-DD HH:MM:SS like format
      const d = dateObject
        ? dateObject.toISOString()
        : new Date().toISOString();
      const [date, time] = d.split("T");
      return `${date} ${time.split(".")[0]}`;
    },
    // custom filter function that works for single (filter is string) &
    // multi select (filter is array) filter
    tableRowFilterFunction(row, filter, filterFields) {
      const check = (p, q) => new RegExp(`.*${p}.*`, "i").test(q);
      if (filter === "") {
        return true;
      }
      if (filter instanceof Object) {
        const fieldsToCheck = filterFields || Object.keys(filter);
        return fieldsToCheck.reduce((p, key) => {
          let matches;
          if (filter[key] instanceof Array) {
            // in case of multiselect filter
            // every value in filter object is an array of accepted values
            // include only rows that match any of those values

            // deep(row, key) returns value for <key> in <row>
            matches = filter[key].reduce(
              (p, c) => p || check(c, deep(row, key)),
              false
            );
          } else {
            // in case of single select filter there is only one accepted value
            matches = check(filter[key], deep(row, key));
          }
          return p && matches;
        }, true);
      }
      return true;
    },
    formatShippingType(typeId) {
      switch (typeId) {
        case 1:
          return "To each Point of Sale";
        case 2:
          return "To group headquarters";
        case 3:
          return "To a new address";
        default:
          return "-";
      }
    },
    getStatusOrder() {
      return [
        { text: "Active", variant: "purple", value: 1 },
        { text: "Completed", variant: "success", value: 2 },
        { text: "Cancled", variant: "danger", value: 3 }
      ];
    },
    createTodayDateInFormat() {
      //format: YYYY-MM-DD
      var d = new Date(),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    }
  }
};
