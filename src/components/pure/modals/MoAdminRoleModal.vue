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
      Please, choose the Dashboard
    </h3>
    <form>
      <b-button class="mo-btn mt-4 w-100" @click="$emit('submit', false)"
        >Admin dashboard</b-button
      >
      <b-button
        class="mo-btn__secondary mt-4 w-100"
        @click="$emit('submit', true)"
        >Registered Group</b-button
      >
    </form>
  </b-modal>
</template>

<script>
export default {
  name: "MoAdminRoleModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  }
};
</script>
