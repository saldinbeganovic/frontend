<template>
  <sidebar>
    <router-view></router-view>
  </sidebar>
</template>
<script>
import Sidebar from "@/layouts/MoSidebar";
import manufacturer from "@/router/manufacturer";

export default {
  components: {
    Sidebar
  },
  beforeMount() {
    this.$store.commit("setRoutes", manufacturer);
  }
};
</script>
