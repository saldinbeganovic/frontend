<template>
  <mo-dashboard
    title="Video Library"
    :tab-items="tabItems"
    @search="searchQuery = $event"
  >
  
    <template #library-of-videos>
      
      <videos
        ref="videos"
        @refetch-archive="onRefetchArchive"
        :search-query="searchQuery"
        :cardView="cardView"
        @toggle-card="cardView = !cardView"
      />
     
      <archive
        ref="archive"
        @refetch-videos="onRefetchVideos"
        :search-query="searchQuery"
        :cardView="cardView"
      />

      
    </template>
  
    <template #schedules>
      <schedules :search-query="searchQuery" />
    </template>
  </mo-dashboard>
</template>

<script>
import Videos from "./Videos";
import Archive from "./Archive";

import Schedules from "@/views/user/video/Schedules";

export default {
  name: "VideoLibrary",
  components: {
    Schedules,
    Videos,
    Archive,
   
  },
  data() {
    return {
      searchQuery: "",
      cardView: true
    };
  },
  
  computed: {
    tabItems() {
      return ["Library of videos", "Schedules"];
    }
  },
  methods: {
    onRefetchArchive() {
      this.$refs.archive.fetchData();
    },
    onRefetchVideos() {
      this.$refs.videos.fetchData();
    }
  }
};
</script>
