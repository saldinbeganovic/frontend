<template>
  <div>
    <h3 class="text-center">Select the new video</h3>
    <videos
      ref="videos"
      :search-query="searchQuery"
      :card-view="cardView"
      :select-for-wizzard="true"
      @toggle-card="cardView = !cardView"
      @selected-video="onVideoSelect"
    />
  </div>
</template>

<script>
import Videos from "@/views/user/video/Videos";
export default {
  name: "SelectScreen",
  components: {
    Videos
  },
  props: {
    unit: {
      type: Object
    }
  },
  data() {
    return {
      searchQuery: "",
      cardView: true
    };
  },
  mounted() {},
  computed: {
    getPosRequestData() {
      return {
        is_archived: 0,
        without_units: 0
      };
    }
  },
  methods: {
    onVideoSelect(videoId) {
      this.$emit("selected-video", videoId);
    }
  }
};
</script>

<style lang="scss"></style>
