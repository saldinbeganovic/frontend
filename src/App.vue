<template>
  <div id="app">
    <b-container
      v-if="$store.state.error"
      class="h-100 d-flex flex-column justify-content-center align-items-center mo-error"
    >
      <i class="fa fa-exclamation-triangle m-3" />
      <h3>{{ errorMessage }}</h3>
      <p>{{ errorDescription }}</p>
      <b-button class="mo-plain-button" @click="onRetry">
        Retry
      </b-button>
    </b-container>
    <b-container
      v-if="isMobileDevice"
      class="h-100 d-flex flex-column justify-content-center align-items-center mo-error"
    >
      <mo-logo height="80px" width="80px" :show-title="false" />
      <h3>Device not supported</h3>
      <p class="text-center">
        Device with screen resolution {{ screenResolution }} is currently not
        supported.
      </p>
      <p v-if="isSupportedMobileOs">
        Please download mobile app instead.
      </p>
      <p v-else class="text-center">
        Your OS is not supported.
      </p>
      <a class="mo-store-btn" v-if="isIos" href="#"
        ><img
          alt="Get it on App Store"
          src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg"
      /></a>
      <a
        class="mo-store-btn"
        v-if="isAndroid"
        href="https://play.google.com/store/apps/details?id=eu.fiveoseven.monitorapp&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
        ><img
          alt="Get it on Google Play"
          src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
      /></a>
    </b-container>
    <div
      v-else-if="$store.state.isLoading"
      class="h-100 d-flex flex-column align-items-center justify-content-center"
    >
      <mo-logo height="80px" width="80px" />
      <b-spinner class="mt-4" label="Loading ..." />
    </div>
    <router-view v-else />
  </div>
</template>

<script>
import {
  clearJwtCache,
  getUserRole,
  isLoggedIn,
  onPageLoad
} from "@/utils/auth";
import "ua-parser-js";
import UAParser from "ua-parser-js";

export default {
  data() {
    return {
      isMobileDevice: false,
      mobileOs: null,
      screenResolution: null
    };
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  beforeCreate() {
    onPageLoad();
    // fetch if the user is not a manufacturer
    if (isLoggedIn() && getUserRole() !== 3) {
      this.$store.dispatch("fetchData");
    }
  },
  computed: {
    isSupportedMobileOs() {
      return ["Android", "iOs"].includes(this.mobileOs);
    },
    isAndroid() {
      return /Android/.test(this.mobileOs);
    },
    isIos() {
      return this.mobileOs === "iOS";
    },
    errorMessage() {
      if (this.isErrorWithCode(404)) {
        return "Not found error";
      }
      if (this.isErrorWithCode(403)) {
        return "Forbidden error";
      }
      if (this.isErrorWithCode(500)) {
        return "Internal server error";
      }
      return this.$store.state.error.message;
    },
    errorDescription() {
      if (this.isErrorWithCode(404)) {
        return "Your group may have been removed. Please contact your admin.";
      }
      if (this.isErrorWithCode(403)) {
        return "Something went wrong with the user's session. Please try logging in again.";
      }
      if (this.isErrorWithCode(500)) {
        return "Looks like we have some issues with our servers. Please try again later.";
      }
      return "Unknown error. Please try again later or contact your admin.";
    }
  },
  methods: {
    onResize() {
      this.isMobileDevice = window.innerWidth < 1000;
      this.screenResolution = `${window.innerWidth}px x ${window.innerHeight}px`;
      const parser = new UAParser(window.navigator.userAgent);
      this.mobileOs = parser.getOS().name;
    },
    isErrorWithCode(code) {
      return this.$store.state.error.message.indexOf(`${code}`) > -1;
    },
    onRetry() {
      this.$store.commit("clearRootStore");
      localStorage.removeItem("company-id");
      clearJwtCache();
      if (isLoggedIn()) {
        this.$store.dispatch("fetchData", {
          isAdminDashboard: this.isAdminDashboard
        });
      } else {
        this.$router.replace("/login");
        setTimeout(() => {
          this.$bvToast.toast("Retry failed, please contact your admin!", {
            variant: "danger",
            title: "Login error"
          });
        }, 200);
      }
    }
  }
};
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
@import "~bootstrap-vue/src/index.scss";
@import "./assets/scss/index.scss";
@import "~vue-multiselect/dist/vue-multiselect.min.css";
</style>
