<template>
  <mo-dashboard
    title="Maintenance"
    :tab-items="tabItems"
    @search="searchQuery = $event"
  >
    <template #maintenances>
      <maintenances
        :search-query="searchQuery"
        @refetch-archive="onRefetchArchive"
      />
      <archive ref="archive" :search-query="searchQuery" />
    </template>
  </mo-dashboard>
</template>

<script>
import Maintenances from "./Maintenances";
import Archive from "./Archive";

export default {
  name: "Services",
  components: {
    Maintenances,
    Archive
  },
  data() {
    return {
      searchQuery: "",
      tabItems: ["Maintenances"]
    };
  },
  methods: {
    onRefetchArchive() {
      this.$refs.archive.fetchData();
    }
  }
};
</script>
