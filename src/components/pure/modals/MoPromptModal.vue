<template>
  <b-modal
    :id="modalId"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body"
    hide-footer
    hide-header
    centered
    :no-close-on-backdrop="noCloseOnBackdrop"
  >
    <b-row class="mb-4">
      <h4 class="text-center font-weight-light w-100">
        {{ message }}
      </h4>
      <p v-if="description" class="text-center font-weight-light mt-2">
        {{ description }}
      </p>
      <slot name="body"></slot>
    </b-row>
    <b-row class="w-100">
      <b-col>
        <mo-button
          :title="leftOption"
          :variant="leftOptionVariant"
          :tooltip="leftOptionTooltip"
          width="100%"
          @click="onOption('left')"
        />
      </b-col>
      <b-col>
        <mo-button
          :title="rightOption"
          :variant="rightOptionVariant"
          :tooltip="rightOptionTooltip"
          width="100%"
          @click="onOption('right')"
        />
      </b-col>
    </b-row>
  </b-modal>
</template>

<script>
export default {
  name: "MoPromptModal",
  props: {
    modalId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    leftOption: {
      type: String,
      default: "No"
    },
    leftOptionTooltip: {
      type: String,
      default: null
    },
    rightOptionTooltip: {
      type: String,
      default: null
    },
    rightOption: {
      type: String,
      default: "Yes"
    },
    leftOptionVariant: {
      type: String,
      default: ""
    },
    rightOptionVariant: {
      type: String,
      default: "danger"
    },
    overrideCheckbox: {
      type: Boolean,
      default: false
    },
    noCloseOnBackdrop: {
      type: Boolean,
      deafult: false
    }
  },
  methods: {
    onOption(type) {
      this.$emit(type);
      this.$bvModal.hide(this.modalId);
    }
  }
};
</script>
