<template>
  <mo-dashboard
    title="Units"
    :tab-items="tabItems"
    @search="searchQuery = $event"
  >
    <template #units>
      <units :search-query="searchQuery" />
    </template>
    <template #batches>
      <batches :search-query="searchQuery" />
    </template>
  </mo-dashboard>
</template>

<script>
import Units from "@/views/manufacturer/units/Units";
import Batches from "@/views/manufacturer/units/Batches";

export default {
  name: "index",
  components: {
    Units,
    Batches
  },
  data() {
    return {
      searchQuery: ""
    };
  },
  computed: {
    tabItems() {
      return ["Units", "Batches"];
    }
  }
};
</script>
