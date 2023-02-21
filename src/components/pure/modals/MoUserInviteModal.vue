<template>
  <b-modal
    :id="modalId"
    hide-footer
    hide-header
    size="lg"
    centered
    content-class="mo-input-modal"
    body-class="mo-input-modal-body"
  >
    <h3 class="text-center font-weight-light mb-5">
      Set your user up
    </h3>
    <b-form @submit.prevent="onSubmit">
      <b-form-group id="input-group-4">
        <b-form-input
          id="input-2"
          v-model="user.first_name"
          placeholder="First name"
          type="text"
          class="mo-input"
          autocomplete="first-name"
          required
        ></b-form-input>
      </b-form-group>
      <b-form-group id="input-group-4">
        <b-form-input
          id="input-2"
          v-model="user.last_name"
          placeholder="Last name"
          type="text"
          class="mo-input"
          autocomplete="last-name"
          required
        ></b-form-input>
      </b-form-group>
      <b-form-group id="input-group-4">
        <b-form-input
          id="input-2"
          v-model="user.password"
          placeholder="New password"
          type="password"
          class="mo-input"
          autocomplete="new-password"
          required
        ></b-form-input>
      </b-form-group>
      <b-form-group id="input-group-4">
        <b-form-input
          id="input-2"
          v-model="user.password_confirmation"
          placeholder="Confirm new password"
          type="password"
          class="mo-input"
          autocomplete="new-password"
          required
        ></b-form-input>
      </b-form-group>
      <b-button type="submit" class="mo-btn mt-4">Submit</b-button>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  name: "MoUserInviteModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      user: {
        first_name: "",
        last_name: "",
        password: "",
        password_confirmation: ""
      }
    };
  },
  methods: {
    onSubmit() {
      this.$emit("submit", this.user);
    }
  }
};
</script>
