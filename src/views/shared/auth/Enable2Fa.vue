<template>
  <mo-dashboard title="Enable 2FA">
    <template #body>
      <mo-dashboard-body :loading="isLoading">
        <template #body>
          <!-- two factor code input modal   -->
          <mo-two-factor-modal modal-id="2fa-modal" @submit="onConfirm" />
          <b-col>
            <b-row class="m-5" style="height: 200px;">
              <div ref="qrCodePlaceholder" v-html="qrCode" />
            </b-row>
            <b-row>
              <ol>
                <li>
                  Download & open
                  <a
                    href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=sl&gl=US"
                    >Google authenticator</a
                  >
                  app.
                </li>
                <li>
                  Click "+" button in bottom right corner & select "Scan a QR
                  code"
                </li>
                <li>Scan the above QR code</li>
                <li>
                  Click "enable" and enter a confirmation code from your Google
                  authenticator app.
                </li>
              </ol>
            </b-row>
          </b-col>
        </template>
        <template #footer-right>
          <mo-button title="Enable" @click="$bvModal.show('2fa-modal')" />
        </template>
      </mo-dashboard-body>
    </template>
  </mo-dashboard>
</template>

<script>
import { enable2fa, confirm2fa } from "@/api/authentication";
import MoTwoFactorModal from "@/components/pure/modals/MoTwoFactorModal";

export default {
  name: "Enable2Fa",
  components: {
    MoTwoFactorModal
  },
  data() {
    return {
      isLoading: false,
      qrCode: null
    };
  },
  async mounted() {
    // decode base64 encoded svg
    this.qrCode = atob(await this.handleFetch(enable2fa()));
    const size = "200px";
    this.$nextTick(() => {
      const svg = this.$refs.qrCodePlaceholder.querySelector("svg");
      svg.style.width = size;
      svg.style.height = size;
    });
  },
  methods: {
    onConfirm(twoFactorCode) {
      confirm2fa(twoFactorCode)
        .then(() => {
          this.$router.back();
          this.$store.dispatch("fetchUser");
          setTimeout(() => {
            this.$bvToast.toast(
              "You can not login with the code from your authenticator app.",
              { title: "2FA enabled" }
            );
          }, 200);
        })
        .catch(error => {
          this.$bvToast.toast(error.response.data.message, {
            variant: "danger",
            title: "2FA enable error"
          });
        });
    }
  }
};
</script>
