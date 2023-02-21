<template>
  <mo-dashboard :tab-items="tabItems" title="Player">
    <template #body>
      <edit />
    </template>
    <template #overview>
      <edit />
    </template>
    <template #screenshots>
      <screenshots ref="screenshots" />
    </template>
    <template #logs>
      <logs ref="logs" />
    </template>
    <template #online>
      <uptime :player-id="playerId" />
    </template>
    <template #remote-actions>
      <remote-actions :player-id="playerId" />
    </template>
  </mo-dashboard>
</template>

<script>
import Edit from "@/views/admin/device/player/Edit";
import Screenshots from "@/views/admin/device/player/Screenshots";
import Logs from "@/views/admin/device/player/Logs";
import Uptime from "@/components/statefull/tables/MoUptime";
import RemoteActions from "@/views/admin/device/player/RemoteActions";
export default {
  name: "index",
  components: {
    Edit,
    Screenshots,
    Logs,
    Uptime,
    RemoteActions
  },
  computed: {
    playerId() {
      return this.$route.params.playerId;
    },
    isNew() {
      return this.playerId === "new";
    },
    tabItems() {
      return this.isNew ? [] : ["Overview", "Screenshots", "Logs", "Online", "Remote Actions"];
    }
  }
};
</script>
