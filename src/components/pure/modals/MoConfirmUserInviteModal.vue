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
      Confirm invitation to group
    </h3>
    <b-form @submit.prevent="onSubmit">
      <b-button type="submit" class="mo-btn mt-4">Submit</b-button>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  name: "MoConfirmUserInviteModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      newPassword: "",
      newPasswordRetyped: ""
    };
  },
  computed: {},
  methods: {
    onSubmit() {
      this.$emit("submit", this.newPassword, this.newPasswordRetyped);
    }
  }
};
</script>
