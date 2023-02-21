<template>
  <label :class="`w-100 ${this.labelClass}`" @click="$emit('click')">
    <select
      :class="classList"
      :style="containerStyle"
      :value="value"
      :disabled="disabled"
      @change="onSelect"
    >
      <option v-for="o in options" :key="o.value" :value="o.value">
        {{ o.text }}
      </option>
    </select>
  </label>
</template>

<script>
export default {
  name: "MoSelectBadge",
  props: {
    variant: {
      type: String
    },
    value: {
      required: true
    },
    options: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    noBorder: {
      type: Boolean,
      default: false
    },
    labelClass: {
      type: String,
      default: "text-center"
    },
    selectClass: {
      type: String,
      default: ""
    },
    width: {
      type: String,
      default: "100px"
    }
  },
  computed: {
    containerStyle() {
      return {
        width: this.width,
        textAlignLast: "center" // works only in chrome
      };
    },
    classList() {
      return `mo-status-badge py px-2${
        this.variant ? ` mo-status-badge__${this.variant}` : ""
      } ${this.noBorder ? "mo-border__none" : ""} ${this.selectClass}`;
    }
  },
  methods: {
    onSelect(e) {
      this.$emit("change", e.target.value);
    }
  }
};
</script>
