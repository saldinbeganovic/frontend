<template>
  <button
    :disabled="disabled || !clickable"
    @click.prevent="$emit('click', $event)"
    :class="classList"
  >
    {{ title }}
  </button>
</template>

<script>
export default {
  name: "MoStatusBadge",
  props: {
    title: {
      type: String,
      required: true
    },
    // disabled, danger, success, purple
    variant: {
      type: String
    },
    // disabled disables click event, cursor pointer and also makes a button appear grayed out
    disabled: {
      type: Boolean,
      default: false
    },
    // clickable only disables click events and cursor pointer
    clickable: {
      type: Boolean,
      default: true
    },
    border: {
      type: String,
      default: ""
    }
  },
  computed: {
    classList() {
      return `mo-status-badge${
        this.disabled ? "__disabled" : ""
      } py px-2 mo-status-badge${
        this.variant
          ? `__${this.variant}${this.clickable ? "" : "__unclickable"}`
          : ""
      } mo-border${this.border ? `__${this.border}` : ""}`;
    }
  }
};
</script>
