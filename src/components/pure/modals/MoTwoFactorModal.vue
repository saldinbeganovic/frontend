<template>
  <b-modal
    hide-footer
    hide-header
    :id="modalId"
    size="lg"
    centered
    content-class="mo-input-modal"
    body-class="mo-input-modal-body"
  >
    <h3 class="text-center font-weight-light mb-4">
      Please, enter the code from your authentification app
    </h3>
    <mo-code-input @done="onConfirm" :code-length="6" />
  </b-modal>
</template>

<script>
export default {
  name: "MoTwoFactorModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  methods: {
    onConfirm(code) {
      this.$emit("submit", code);
    }
  }
};
</script>
