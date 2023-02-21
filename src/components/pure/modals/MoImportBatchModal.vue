<template>
  <b-modal
    :id="modalId"
    hide-footer
    hide-header
    size="lg"
    centered
    body-class="mo-input-modal-body"
  >
    <h3 class="text-center mb-5">
      Import tech data for units"
    </h3>
    <b-form-group label="Enter player code" label-for="player-input">
      <mo-code-input :code-length="6" @done="$emit('submit', $event)" />
    </b-form-group>
  </b-modal>
</template>

<script>
export default {
  name: "MoImportBatchModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  computed: {
    companyId() {
      return this.$store.getters.companyId;
    }
  }
};
</script>
