<template>
  <mo-sidebar>
    <router-view></router-view>
  </mo-sidebar>
</template>
<script>
import MoSidebar from "@/layouts/MoSidebar";
import user from "@/router/user";

export default {
  components: {
    MoSidebar
  },
  beforeMount() {
    this.$store.commit("setRoutes", user);
  }
};
</script>
