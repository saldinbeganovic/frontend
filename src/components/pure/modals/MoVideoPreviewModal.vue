<template>
  <b-modal
    :id="modalId"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body m-0"
    dialog-class="mo-image-modal__dialog"
    hide-footer
    hide-header
    centered
  >
    <b-row>
      <b-col>
        <b-row>
          <b-col>
            <mo-video-player :video-path="videoPath" />
          </b-col>
        </b-row>
        <b-row v-if="videoInfo" class="mt-2 float-right">
          <b-col
            >{{ videoInfo.title }}
            <small>({{ formatBytes(videoInfo.size) }})</small></b-col
          >
        </b-row>
      </b-col>
    </b-row>
  </b-modal>
</template>

<script>
export default {
  name: "MoVideoPreviewModal",
  props: {
    videoPath: {
      required: true
    },
    modalId: {
      type: String,
      required: true
    },
    videoInfo: {
      type: Object,
      default: null
    }
  }
};
</script>
<style lang="scss">
.mo-image-modal__dialog {
  max-width: 700px !important;
}
</style>
