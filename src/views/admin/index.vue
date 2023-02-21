<template>
  <sidebar>
    <router-view></router-view>
  </sidebar>
</template>
<script>
import Sidebar from "@/layouts/MoSidebar";
import admin from "@/router/admin";

export default {
  components: {
    Sidebar
  },
  beforeMount() {
    this.$store.commit("setRoutes", admin);
  }
};
</script>
