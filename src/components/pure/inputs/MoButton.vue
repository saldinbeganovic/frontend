<template>
  <b-button
    ref="container"
    :class="classList"
    @click="$emit('click', $event)"
    :style="style"
    :type="type"
    :disabled="loading || disabled"
    v-b-tooltip.hover
    :title="tooltip"
  >
    <template v-if="!loading">
      <i v-if="_iconName" :class="`fas ${_iconName} mr-1 ml-2`" />
      <span v-if="showTitle" class="m-2">{{ title }}</span>
    </template>
    <template v-else>
      <span class="spinner-border spinner-border-sm" role="status" />
      Loading...
    </template>
  </b-button>
</template>

<script>
export default {
  name: "MoButton",
  props: {
    loading: Boolean,
    disabled: Boolean,
    type: {
      type: String
    },
    variant: {
      type: String,
      default: null
    },
    title: {
      type: String,
      required: true
    },
    width: {
      type: [String],
      default: "200px"
    },
    outline: {
      type: Boolean,
      default: false
    },
    large: {
      type: Boolean,
      default: false
    },
    tooltip: {
      type: String,
      default: null
    },
    iconName: {
      type: String,
      default: null
    },
    adminOnly: {
      type: Boolean,
      deafult: false
    }
  },
  data() {
    return {
      showTitle: true,
      btnTitleToIconNameMap: {
        Add: "fa-plus",
        Update: "fa-save",
        Save: "fa-save",
        Delete: "fa-trash",
        Remove: "fa-trash",
        Block: "fa-minus-circle",
        Unblock: "fa-unlock-alt",
        Import: "fa-file-import",
        Activate: "fa-unlock",
        Assign: "fa-link",
        Move: "fa-arrows-h",
        Archive: "fa-archive",
        Unarchive: "fa-archive",
        Schedule: "fa-clock",
        Download: "fa-download",
        Change: "fa-exchange-alt",
        Qr: "fa-qrcode",
        Copy: "fa-copy",
        Enable: "fa-power-off",
        Disable: "fa-power-off",
        Yes: "fa-check",
        Okay: "fa-check",
        No: "fa-times",
        Skip: "fa-forward",
        Next: "fa-forward",
        Back: "fa-backward",
        Upload: "fa-upload",
        Edit: "fa-edit",
        Order: "fa-dolly",
        Send: "fa-paper-plane",
        Create: "fa-video-plus",
        CALCULATE:"fa-calculator",
        Network: "fa-wifi",
        Reboot: "fa-sync",
      }
    };
  },
  computed: {
    variantClass() {
      return this.variant ? `__${this.variant}` : "";
    },
    outlineClass() {
      return this.outline ? "__outline" : "";
    },
    classList() {
      return `mo-btn${this.large ? "" : "__sm"}${this.variantClass}${
        this.outlineClass
      }`;
    },
    _iconName() {
      const prefix = this.title.split(" ")[0];
      return this.iconName || this.btnTitleToIconNameMap[prefix];
    },
    style() {
      return {
        width: this.large ? "unset" : this.width
      };
    }
  },
  mounted() {
    new ResizeObserver(([e]) => {
      this.showTitle = !(e.target.clientWidth < 150 && this._iconName);
    }).observe(this.$refs.container);
  }
};
</script>
