<template>
  <b-modal
    :id="modalId"
    hide-footer
    hide-header
    size="lg"
    centered
    body-class="mo-input-modal-body"
  >
    <div
      v-if="isLoading"
      class="w-100 d-flex justify-content-center mo-text__primary"
    >
      <b-spinner label="Loading ..."></b-spinner>
    </div>

    <div v-else class="d-flex flex-wrap w-100">
      <mo-video-card
        v-for="video in items"
        :key="video.id"
        type="video"
        :title="video.title"
        :hide-checkbox="true"
        style="width: 30%"
        class="mx-2"
        :thumbnail="video.thumbnail"
        :hide-edit-button="true"
        @checked="onSubmit(video)"
        :height="150"
      />
    </div>
  </b-modal>
</template>

<script>
import { getVideosOfCompany } from "@/api/user/video/video";
import MoVideoCard from "@/components/pure/MoVideoCard";

export default {
  name: "MoChooseVideoModal",
  components: {
    MoVideoCard
  },
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      items: []
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onSubmit(video) {
      this.$emit("submit", video);
    },
    fetchData() {
      this.isLoading = true;
      this.handleFetch(getVideosOfCompany(this.$store.getters.companyId))
        .then(data => {
          this.items = data;
        })
        .catch(e => {
          this.$bvToast.toast(
            `An error occurred while fetching data: ${e.message}`
          );
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }
};
</script>

<style scoped></style>
