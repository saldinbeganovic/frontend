<template>
  <b-modal
    :id="modalId"
    dialog-class="mo-video-modal__dialog"
    hide-footer
    hide-header
    centered
  >
    <mo-screen-wrapper-modal ref="editVideoModal" #body="{props}">
      <mo-edit-video :video-id="props.videoId" @exit="onExitEdit" />
    </mo-screen-wrapper-modal>
    <b-row
      class="w-100 d-flex justify-content-center overflow-auto"
      style="max-height: 60vh"
    >
      <span v-if="videos.length === 0">No {{ cardType }}s to show</span>
      <mo-video-card
        v-for="video in videos"
        :key="video.id"
        class="mb-3 mx-3"
        :type="cardType"
        :checked="Boolean(selected[video.id])"
        :title="video.title"
        :videos-count="cardType === 'video' ? video.videos_count : null"
        :thumbnail="video.thumbnail"
        @checked="onChecked(video, $event)"
        @edit="onEditVideo(video.id)"
      />
    </b-row>
    <b-row class="w-100 mt-3">
      <b-col>
        <span v-if="!singleSelect">Selected: {{ selectedItems.length }}</span>
      </b-col>
      <b-col class="d-flex flex-row justify-content-end">
        <mo-button :title="title" @click="onUpdate" />
      </b-col>
    </b-row>
  </b-modal>
</template>

<script>
import MoVideoCard from "@/components/pure/MoVideoCard";
import MoEditVideo from "@/views/user/video/EditVideo";

export default {
  name: "MoVideosModal",
  components: {
    MoEditVideo,
    MoVideoCard
  },
  props: {
    modalId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: "Add selected"
    },
    videos: {
      type: Array,
      required: true
    },
    cardType: {
      type: String,
      default: "video"
    },
    singleSelect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selected: {}
    };
  },
  computed: {
    selectedItems() {
      return Object.keys(this.selected).filter(k => this.selected[k] === true);
    }
  },
  methods: {
    onChecked(item, isChecked) {
      if (isChecked) {
        // if user is allowed to select a single item
        // unselect other selected item before selecting a new one
        if (this.singleSelect) {
          this.$set(this, "selected", {});
        }
        this.$set(this.selected, item.id, isChecked);
      } else {
        this.$delete(this.selected, item.id);
      }
    },
    onUpdate() {
      this.$emit("submit", this.selectedItems);
      // reset selected items on submit
      this.$set(this, "selected", {});
    },
    onExitEdit() {
      this.$refs.editVideoModal.hide();
    },
    onEditVideo(id) {
      this.$refs.editVideoModal.show({
        videoId: id
      });
    }
  }
};
</script>
<style lang="scss">
.mo-video-modal__dialog {
  max-width: 900px !important;
}
</style>
