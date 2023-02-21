<template>
  <mo-dashboard title="Profile">
    <template #body>
      <validation-observer class="h-100 flex-grow-1">
        <form class="d-flex flex-column justify-content-between h-100">
          <mo-dashboard-body :loading="isLoading">
            <template #body>
              <mo-prompt-modal
                modal-id="manufacturer-change-password-modal"
                message="Do you want to change your password ?"
                description="A link will be sent to your email for you to set a new password."
                @right="onChangePassword"
              />
              <b-col>
                <b-row class="mt-3">
                  <b-col>
                    <b-form-group
                      class="w-100"
                      label="Company name"
                      label-for="company-name"
                    >
                      <b-form-input
                        id="company-name"
                        v-model="companyName"
                        class="mo-input__light-sm"
                        placeholder="Company name"
                        type="text"
                        disabled
                        required
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group class="w-100" label="Email" label-for="email">
                      <b-form-input
                        id="email"
                        v-model="email"
                        class="mo-input__light-sm"
                        placeholder="Email"
                        type="email"
                        disabled
                        required
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                  <b-col></b-col>
                </b-row>
              </b-col>
            </template>
            <template #footer-left>
              <mo-button
                class="ml-2"
                style="width: 220px"
                title="Change password"
                @click="$bvModal.show('manufacturer-change-password-modal')"
              />
            </template>
          </mo-dashboard-body>
        </form>
      </validation-observer>
    </template>
  </mo-dashboard>
</template>

<script>
import { resetPassword } from "@/api/authentication";
import { getManufacturer } from "@/api/manufacturer";

export default {
  name: "Profile",
  data() {
    return {
      isLoading: false,
      companyName: "",
      email: "",
      tabItems: ["Overview", "Users"]
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onChangePassword() {
      this.$bvModal.hide("manufacturer-change-password-modal");
      resetPassword({ email: this.email, change: true })
        .then(() => {
          this.$bvToast.toast("Password change email sent!");
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    },
    fetchData() {
      this.handleFetch(getManufacturer()).then(data => {
        this.companyName = data.name;
        this.email = data.user.email;
      });
    }
  }
};
</script>
