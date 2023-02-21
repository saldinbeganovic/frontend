<template>
  <b-container class="h-100 d-flex flex-column justify-content-center" fluid>
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
        <h1 class="text-center mo-title__big mo-dark mb-3">Hello!</h1>
        <p>Register as a manufacturer.</p>
        <b-form
          class="login d-flex align-center flex-column w-100 mt-5"
          style="max-width: 400px"
          @submit.prevent="onRegister"
        >
          <b-form-group label="Company name" label-for="companyName">
            <b-form-input
              id="companyName"
              class="mo-input my-2"
              v-model="companyName"
              placeholder="Enter company name"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="Email" label-for="email">
            <b-form-input
              id="email"
              class="mo-input"
              v-model="email"
              type="email"
              placeholder="Enter email"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="Password" label-for="password">
            <b-form-input
              id="password"
              class="mo-input my-2"
              v-model="password"
              placeholder="Enter password"
              type="password"
              autocomplete="new-password"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="Confirm password" label-for="confirmPassword">
            <b-form-input
              id="confirmPassword"
              class="mo-input my-2"
              v-model="confirmPassword"
              placeholder="Enter password"
              type="password"
              autocomplete="new-password"
              required
            ></b-form-input>
          </b-form-group>

          <mo-button
            title="Register"
            type="submit"
            :loading="isLoading"
            large
          />
        </b-form>
        <div id="mo-company-signature">
          App by <a href="https://507.eu/">507</a>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { registerManufacturer } from "@/api/manufacturer";

export default {
  name: "Register",
  data() {
    return {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      companyName: "",
      isLoading: false
    };
  },
  methods: {
    onRegister() {
      if (this.password !== this.confirmPassword) {
        return this.$bvToast.toast("Passwords do not match", {
          variant: "info"
        });
      }
      this.handleFetch(
        registerManufacturer({
          email: this.email,
          password: this.password,
          password_confirmation: this.confirmPassword,
          name: this.companyName
        })
      ).then(() => {
        this.$router.replace("/login");
        setTimeout(() => {
          this.$bvToast.toast("You can now login with your credentials.", {
            title: "Registration successful!"
          });
        }, 200);
      });
    }
  }
};
</script>
