<template>
  <b-modal
    :id="modalId"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body m-0"
    dialog-class="mo-input-modal__dialog"
    hide-footer
    hide-header
    centered
  >
    <form style="max-width: unset" @submit.prevent="onSubmit">
      <b-row>
        <mo-upload-file
          ref="fileUpload"
          :max-files="maxFiles"
          :api-endpoint="apiEndpoint"
          :accept="accept"
          :title="title"
          :subtitle="subtitle"
          :body-fields="bodyFields"
          :auto-process="false"
          @success="onUploadSuccess"
          @success-all="onUploadAllSuccess"
          @added="$emit('added', $event)"
        />
      </b-row>
      <slot name="body"></slot>
      <b-row class="justify-content-center">
        <b-button style="width: 200px" class="mo-btn__sm mt-3" type="submit">
          Submit
        </b-button>
      </b-row>
    </form>
  </b-modal>
</template>

<script>
export default {
  name: "MoFileModal",
  props: {
    apiEndpoint: {
      type: String,
      required: true
    },
    modalId: {
      type: String,
      default: "picture-modal"
    },
    accept: {
      type: String,
      default: "image/*"
    },
    title: {
      type: String
    },
    subtitle: {
      type: String
    },
    maxFiles: {
      type: Number,
      default: 1
    },
    bodyFields: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onSubmit() {
      this.$refs.fileUpload.processQueue();
    },
    onUploadSuccess(file, response) {
      this.$emit("success", file, response);
      this.$emit("success-path", response.message);
    },
    onUploadAllSuccess(count) {
      this.$bvModal.hide(this.modalId);
      this.$bvToast.toast(`Successfully uploaded ${count} files!`);
    }
  }
};
</script>
<style lang="scss">
.mo-input-modal__dialog {
  max-width: 700px !important;
}
</style>
