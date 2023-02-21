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
      {{ title }}
    </h3>
    <b-form @submit.prevent="onSubmit">
      <b-form-group id="input-group-4">
        <b-form-input
          id="input-2"
          v-model="newPassword"
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
          v-model="newPasswordRetyped"
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
  name: "MoSetPasswordModal",
  props: {
    modalId: {
      type: String,
      required: true
    },
    isReset: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      newPassword: "",
      newPasswordRetyped: ""
    };
  },
  computed: {
    title() {
      return this.isReset ? "Enter your new password" : "Set your password";
    }
  },
  methods: {
    onSubmit() {
      this.$emit("submit", this.newPassword, this.newPasswordRetyped);
    }
  }
};
</script>
