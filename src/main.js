import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import { BootstrapVue } from "bootstrap-vue";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import VueAxios from "vue-axios";
import axios from "axios";
import "./validation";
import { setInteractionMode } from "vee-validate";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
import MoButton from "@/components/pure/inputs/MoButton";
import FileModal from "@/components/pure/modals/MoFileModal";
import MoPromptModal from "@/components/pure/modals/MoPromptModal";
import Dashboard from "@/layouts/MoDashboard";
import MoImage from "@/components/pure/MoImage";
import MoStatusBadge from "@/components/pure/MoStatusBadge";
import MoMultiSelect from "@/components/pure/inputs/MoMultiSelect";
import MoDashboardBody from "@/layouts/MoDashboardBody";
import MoDropdown from "@/components/pure/inputs/MoDropdown";
import MoTable from "@/components/pure/table";
import MoCodeInput from "@/components/pure/inputs/MoCodeInput";
import VueRouter from "vue-router";
import MoSelectBadge from "@/components/pure/inputs/MoSelectBadge";
import MoUploadPlaylist5 from "@/components/pure/inputs/MoUploadPlaylist5";
import MoUploadFile from "@/components/pure/inputs/MoUploadFile";
import breadcrumb from "@/utils/breadcrumb";
import MoAttachmentList from "@/components/pure/MoAttachmentList";
import { globalMixin } from "@/mixins/common";
import MoProgressModal from "@/components/pure/modals/MoProgressModal";
import MoVideoPlayer from "@/components/pure/MoVideoPlayer";
import actions from "@/mixins/actions";
import MoMultiAdd from "@/components/pure/inputs/MoMultiAdd";
import MoLogo from "./components/pure/MoLogo";
import VuePhoneNumberInput from "vue-phone-number-input";
import "vue-phone-number-input/dist/vue-phone-number-input.css";
import MoCollapseSection from "@/components/pure/MoCollapseSection";
import MoScreenWrapperModal from "@/components/pure/modals/screen-wrapper";

Vue.config.productionTip = false;
Vue.prototype.$breadcrumb = breadcrumb;

axios.defaults.baseURL = process.env.VUE_APP_API_HOST;

// custom monitor components
Vue.component("MoUploadFile", MoUploadFile);
Vue.component("MoSelectBadge", MoSelectBadge);
Vue.component("MoUploadPlaylist5", MoUploadPlaylist5);
Vue.component("MoCodeInput", MoCodeInput);
Vue.component("MoTable", MoTable);
Vue.component("MoMultiSelect", MoMultiSelect);
Vue.component("MoDashboardBody", MoDashboardBody);
Vue.component("MoButton", MoButton);
Vue.component("MoDropdown", MoDropdown);
Vue.component("MoStatusBadge", MoStatusBadge);
Vue.component("MoImage", MoImage);
Vue.component("MoDashboard", Dashboard);
Vue.component("MoFileModal", FileModal);
Vue.component("MoPromptModal", MoPromptModal);
Vue.component("MoAttachmentList", MoAttachmentList);
Vue.component("MoProgressModal", MoProgressModal);
Vue.component("MoVideoPlayer", MoVideoPlayer);
Vue.component("ValidationProvider", ValidationProvider);
Vue.component("ValidationObserver", ValidationObserver);
Vue.component("MoMultiAdd", MoMultiAdd);
Vue.component("MoLogo", MoLogo);
Vue.component("MoCollapseSection", MoCollapseSection);
Vue.component("MoScreenWrapperModal", MoScreenWrapperModal);

Vue.component("vue-phone-number-input", VuePhoneNumberInput);

setInteractionMode("eager");

Vue.use(VueRouter);
Vue.use(VueAxios, axios);

Vue.mixin(globalMixin);
Vue.mixin(actions);

Vue.use(BootstrapVue, {
  BToast: {
    variant: "success"
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
