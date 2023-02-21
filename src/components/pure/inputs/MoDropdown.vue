<template>
  <b-dropdown
    id="dropdown-1"
    :text="title"
    class="mo-dropdown"
    toggle-class="mo-btn__sm__light mo-dropdown"
    menu-class="mo-dropdown__menu mt-2"
    right
    no-caret
  >
    <template #button-content>
      <i class="fas fa-angle-down mr-2" />

      <span>{{ title }}</span>
      <i v-if="iconName" :class="`pl-2 fas ${iconName}`" />
    </template>
    <slot></slot>
  </b-dropdown>
</template>

<script>
export default {
  name: "MoDropdown",
  props: {
    title: {
      type: String,
      required: true
    },
    iconName: {
      type: String
    }
  }
};
</script>
