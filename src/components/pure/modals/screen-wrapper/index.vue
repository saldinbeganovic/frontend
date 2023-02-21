<template>
  <b-modal
    :id="id"
    :content-class="contentClass"
    :body-class="bodyClass"
    :dialog-class="dialogClass"
    hide-footer
    hide-header
    centered
    @show="onShow"
    @hidden="onHidden"
  >
    <slot name="body" :props="props" v-if="isVisible"></slot>
  </b-modal>
</template>

<script>
export default {
  name: "MoScreenWrapperModal",
  props: {
    modalId: {
      type: String
    },
    contentClass: {
      type: String,
      default: "mo-screen-wrapper-modal"
    },
    bodyClass: {
      type: String,
      default: "mo-screen-wrapper-modal__body m-0"
    },
    dialogClass: {
      type: String,
      default: "mo-screen-wrapper-modal__dialog"
    }
  },
  data() {
    return {
      id: this.modalId || this.randId(),
      isVisible: false,
      props: {}
    };
  },
  methods: {
    show(props) {
      this.$set(this, "props", props || {});
      this.$bvModal.show(this.id);
    },
    hide() {
      this.$bvModal.hide(this.id);
    },
    onShow() {
      // conditionally render child component (usually some edit screen)
      // so that mounted() method gets triggered when show() is triggered
      // and not when the MoScreenWrapperModal component is mounted
      // this preserves the fetching logic in edit screens
      this.isVisible = true;
    },
    onHidden() {
      this.isVisible = false;
    },
    randId() {
      return `${Math.round(Math.random() * 1000)}`;
    }
  }
};
</script>
<style lang="scss">
.mo-screen-wrapper-modal {
  &__body {
  }
  &__dialog {
    max-width: 80vw !important;
  }
}
</style>
