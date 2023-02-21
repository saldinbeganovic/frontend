<template>
  <b-modal
    id="loading-progress-modal"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body"
    hide-footer
    hide-header
    centered
    no-close-on-backdrop
  >
    <b>{{ title }}</b>
    <div v-if="body">{{ body }}</div>
    <h1 class="mo-text__primary mt-4 mb-3">{{ value }} %</h1>
    <b-progress
      class="w-100"
      :value="value"
      :max="100"
      height="20px"
      variant="primary"
      striped
      animated
    ></b-progress>
    <mo-button class="mt-4" title="Cancel" @click.prevent="$emit('cancel')" />
  </b-modal>
</template>

<script>
export default {
  name: "MoProgressModal",
  props: {
    modalId: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    body: {
      type: String
    }
  }
};
</script>
