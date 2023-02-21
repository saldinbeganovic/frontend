<template>
  <b-container class="h-100 d-flex flex-column justify-content-center" fluid>
    <!-- two factor code input modal   -->
    <mo-two-factor-modal modal-id="2fa-modal" @submit="onConfirm2faCode" />

    <!-- modal for password replacement, shown on first login -->
    <mo-set-password-modal
      modal-id="change-password-modal"
      @submit="onChangePassword"
      :is-reset="isResetPassword"
    />
    <!-- modal for user invite -->
    <mo-user-invite-modal
      modal-id="user-invite-modal"
      @submit="onUserSubmitForm"
    />

    <!-- modal for existing user invite confirm -->
    <mo-confirm-user-invite-modal
      modal-id="confirm-user-invite-modal"
      @submit="onUserSubmitConformation"
    />

    <!-- admin modal for choosing login role   -->
    <mo-admin-role-modal modal-id="admin-modal" @submit="onLoginAdmin" />

    <!-- admin modal for choosing company id -->
    <mo-picker-modal
      label="Group"
      message="Please, choose the group you would like to access"
      modal-id="company-picker-modal"
      :entity-items="companyItems"
      @submit="onPickCompany"
    />

    <mo-email-modal modal-id="email-modal" @submit="onForgotPassword" />

    <!-- login screen -->
    <b-row class="h-100">
      <b-col class="mo-img-bcg">
        <b-col
          class="d-flex flex-column justify-content-between align-items-left h-100 p-5"
        >
          <b-row class="mo-p__light">
            <mo-logo />
          </b-row>
          <b-row>
            <h2 class="mo-title__big mo-title__light mb-5">
              Monitor and manage your furniture
            </h2>
            <h2 class="mo-title__big mo-title__light">
              All in one place
            </h2>
          </b-row>
          <b-row class="mo-p__light">
            All rights reserved. Monitor. 2021.
          </b-row>
        </b-col>
      </b-col>
      <b-col
        class="d-flex flex-column justify-content-center align-items-center"
      >
        <h1 class="text-center mo-title__big mo-dark mb-5">Hello!</h1>
        <b-form
          class="login d-flex align-center flex-column w-100"
          style="max-width: 400px"
          @submit.prevent="onLogin"
        >
          <b-form-group label-for="email">
            <b-form-input
              id="email"
              class="mo-input"
              v-model="email"
              type="email"
              placeholder="Enter email"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label-for="password">
            <b-form-input
              id="password"
              class="mo-input my-2"
              v-model="password"
              placeholder="Enter password"
              type="password"
              autocomplete="current-password"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group>
            <b-form-checkbox-group :v-model="rememberMe">
              <b-form-checkbox>Remember me</b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>

          <mo-button title="Submit" type="submit" :loading="isLoading" large />

          <b-button
            class="mo-btn__simple mt-3"
            @click="$bvModal.show('email-modal')"
          >
            Forgot password
          </b-button>
        </b-form>
        <div id="mo-company-signature">
          App by <a href="https://507.eu/">507</a>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import {
  isAdmin,
  confirmLogin,
  confirmFirstPassword,
  login,
  confirmResetPassword,
  getUserRole,
  setJwt
} from "@/utils/auth";
import MoTwoFactorModal from "@/components/pure/modals/MoTwoFactorModal";
import MoPickerModal from "@/components/pure/modals/MoPickerModal";
import MoSetPasswordModal from "@/components/pure/modals/MoSetPasswordModal";
import MoAdminRoleModal from "@/components/pure/modals/MoAdminRoleModal";
import { getCompanies } from "@/api/admin/company/company";
import {
  confirmInviteUser,
  confirmInviteExistingUser
} from "@/api/admin/company/user";
import MoEmailModal from "@/components/pure/modals/MoEmailModal";
import { resetPassword } from "@/api/authentication";
import MoUserInviteModal from "@/components/pure/modals/MoUserInviteModal";
import MoConfirmUserInviteModal from "@/components/pure/modals/MoConfirmUserInviteModal";

export default {
  name: "Login",
  components: {
    MoEmailModal,
    MoPickerModal,
    MoTwoFactorModal,
    MoSetPasswordModal,
    MoAdminRoleModal,
    MoUserInviteModal,
    MoConfirmUserInviteModal
  },
  data() {
    return {
      companyItems: [],
      email: "",
      password: "",
      rememberMe: false,
      isLoading: false,
      userId: null,
      loginToken: null
    };
  },
  computed: {
    isResetPassword() {
      return this.$route.path === "/reset-password";
    }
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.loginToken = urlParams.get("token");
    if (this.loginToken) {
      // login token is found in query params
      // this means that the user want's to login for the first time
      switch (this.$route.path) {
        case "/reset-password":
          this.$bvModal.show("change-password-modal");
          break;
        case "/user-invite":
          this.$bvModal.show("user-invite-modal");
          break;
        case "/confirm-user-invite":
          this.$bvModal.show("confirm-user-invite-modal");
          break;
        default:
          this.$bvModal.show("change-password-modal");
          break;
      }
    }
  },
  methods: {
    onLogin() {
      this.isLoading = true;
      login(this.email, this.password, this.rememberMe)
        .then(() => {
          switch (getUserRole()) {
            // admin
            case 1: {
              this.$store.dispatch("fetchData");
              this.$router.replace("/user/unit");
              break;
            }
            // user
            case 2: {
              this.$bvModal.show("admin-modal");
              break;
            }
            // manufacturer
            case 3: {
              this.$router.replace("/manufacturer/profile");
            }
          }
        })
        .catch(error => {
          if (!error.response) {
            this.$bvToast.toast(`${error.message}. Please try again later.`, {
              variant: "danger",
              title: error.code
            });
          } else if (
            error.response.data.message === "Please enter your secret key"
          ) {
            this.$bvModal.show("2fa-modal");
            this.userId = error.response.data.user;
          } else {
            const message = error.response.data.message;
            this.$bvToast.toast(
              /block/.test(message)
                ? `${message} Please contact monitor support.`
                : message,
              {
                title: "Login error",
                variant: "danger"
              }
            );
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    onLoginAdmin(loginAsUser) {
      this.$bvModal.hide("admin-modal");
      if (loginAsUser) {
        this.fetchCompanies();
        this.$bvModal.show("company-picker-modal");
      } else {
        this.$router.replace("/admin/unit");
      }
    },
    onUserSubmitForm(userData) {
      confirmInviteUser(this.$route.query.company_id, {
        token: this.loginToken,
        ...userData
      })
        .then(authenticationData => {
          setJwt(authenticationData.access_token);
          window.localStorage.setItem(
            "company-id",
            this.$route.query.company_id
          );
          this.$store.dispatch("fetchData");

          this.$bvToast.toast(`User was successfully created!`);
        })
        .finally(() => {
          this.$router.replace("/user/unit");
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    },
    onUserSubmitConformation() {
      confirmInviteExistingUser(this.$route.query.company_id, {
        token: this.loginToken
      })
        .then(authenticationData => {
          setJwt(authenticationData.access_token);
          window.localStorage.setItem(
            "company-id",
            this.$route.query.company_id
          );
          this.$store.dispatch("fetchData");
          this.$bvToast.toast(`User was successfully created!`);
        })
        .finally(() => {
          this.$router.replace("/user/unit");
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    },
    onPickCompany(companyId) {
      // store company id in local storage so it isn't lost
      // if user refreshes the page
      window.localStorage.setItem("company-id", companyId);
      this.$bvModal.hide("company-picker-modal");
      this.$router.replace("/user/unit");
      this.$store.dispatch("fetchData");
    },
    onConfirm2faCode(twoFactorCode) {
      confirmLogin(this.userId, twoFactorCode)
        .then(() => {
          this.$bvModal.hide("2fa-modal");
          this.$bvToast.toast("Logged in!", { title: "Success" });
          this.$store.dispatch("fetchData");
          if (isAdmin()) {
            this.$bvModal.show("admin-modal");
          } else {
            this.$router.push("/user/unit");
            this.$store.dispatch("fetchData");
          }
        })
        .catch(() => {
          this.$bvToast.toast("Did you enter the correct code ?", {
            variant: "danger",
            title: "Two factor error"
          });
        });
    },
    onForgotPassword(email) {
      resetPassword({ email })
        .then(() => {
          this.$bvToast.toast("Password reset send. Check your email.");
          this.$bvModal.hide("email-modal");
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, {
            title: "Forgot password error",
            variant: "danger"
          });
        });
    },
    onChangePassword(newPassword, newPasswordRetyped) {
      if (newPassword !== newPasswordRetyped) {
        this.$bvToast.toast("Passwords do not match!", {
          title: "Login error",
          variant: "danger"
        });
        return;
      }
      if (this.isResetPassword) {
        confirmResetPassword({ password: newPassword, token: this.loginToken })
          .then(() => {
            this.$bvToast.toast("Password changed. You can now login.");
            this.$bvModal.hide("change-password-modal");
          })
          .catch(e => {
            this.$bvToast.toast(e.message, {
              title: "Login error",
              variant: "danger"
            });
          });
      } else {
        confirmFirstPassword({ password: newPassword, token: this.loginToken })
          .then(() => {
            this.$router.replace("/login");
            this.$bvToast.toast("Password set. You can now login.");
            this.$bvModal.hide("change-password-modal");
          })
          .catch(e => {
            if (e.response.status === 404) {
              return this.$bvToast.toast(
                "This link is invalid, because you've already set your password.",
                {
                  title: "Password token invalid.",
                  variant: "danger"
                }
              );
            }
            this.$bvToast.toast(e.message, {
              title: "Login error",
              variant: "danger"
            });
          });
      }
    },
    fetchCompanies() {
      getCompanies().then(data => {
        this.companyItems = [
          { value: null, text: "Please choose a group" },
          ...data.map(e => ({
            value: e.id,
            text: e.name
          }))
        ];
      });
    }
  }
};
</script>
