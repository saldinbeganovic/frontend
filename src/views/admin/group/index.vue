<template>
  <dashboard
    :tab-items="tabItems"
    :title="title"
    @search="searchQuery = $event"
  >
    <template #body>
      <overview />
    </template>
    <template #overview>
      <overview />
    </template>
    <template #users>
      <users :search-query="searchQuery" />
    </template>
    <template #pos>
      <pos :search-query="searchQuery" />
    </template>
  </dashboard>
</template>

<script>
import Dashboard from "@/layouts/MoDashboard";
import Overview from "@/views/admin/group/Edit";
import Users from "@/views/shared/user/Users";
import Pos from "@/views/admin/group/PointsOfSale";

export default {
  name: "Edit",
  components: {
    Dashboard,
    Overview,
    Pos,
    Users
  },
  computed: {
    title() {
      return this.isNew ? `Add group` : `Edit group`;
    },
    tabItems() {
      return this.isNew ? [] : ["Overview", "Users", "POS"];
    },
    isNew() {
      return this.$route.params.companyId === "new";
    }
  },
  data() {
    return {
      searchQuery: ""
    };
  }
};
</script>
