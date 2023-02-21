<template>
  <mo-dashboard
    title="Devices"
    :tab-items="tabItems"
    @search="searchQuery = $event"
  >
    <template #modems>
      <modems :search-query="searchQuery" />
    </template>
    <template #players>
      <players :search-query="searchQuery" />
    </template>
  </mo-dashboard>
</template>
<script>
import Modems from "@/views/admin/device/modem/Modems";
import Players from "@/views/admin/device/player/Players";

export default {
  name: "Companies",
  components: {
    Modems,
    Players
  },
  data() {
    return {
      searchQuery: ""
    };
  },
  computed: {
    tabItems() {
      return ["Modems", "Players"];
    }
  }
};
</script>
