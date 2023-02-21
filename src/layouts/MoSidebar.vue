<template>
  <b-container class="h-100 mo-sidebar-layout" fluid>
    <b-row class="h-100 flex-nowrap">
      <b-col class="mo-body">
        <slot></slot>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "MoSidebar"
};
</script>
