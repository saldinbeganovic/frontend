<template>
  <a
    class="mo-img d-block d-flex flex-column align-items-center justify-content-center"
    :style="{
      backgroundImage: imageCss,
      ...containerStyle,
      width,
      height
    }"
    :disabled="disabled"
  >
    <div
      class="mo-img__logo d-flex flex-column align-items-center justify-content-center"
      v-if="!image"
    >
      <i class="fas fa-image d-flex align-items-center" />
      <span>{{ previewMessage }}</span>
    </div>
    <div
      v-if="!disabled && showDelete"
      class="mo-img__delete d-flex align-items-center justify-content-center"
      @click="onDelete"
    >
      <i class="fas fa-trash" />
    </div>
    <div
      v-if="!disabled && showExpand"
      class="mo-img__expand d-flex align-items-center justify-content-center"
      @click="onExpand"
    >
      <i class="fas fa-expand-arrows" />
    </div>
    <div
      v-if="!disabled"
      class="mo-img__edit d-flex align-items-center justify-content-center"
      @click="onEdit"
    >
      <i class="fas fa-edit" />
    </div>
  </a>
</template>

<script>
export default {
  name: "MoImage",
  props: {
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    image: {
      type: String
    },
    previewMessage: {
      type: String,
      default: "Add image"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: "300px"
    },
    height: {
      type: String
    },
    showDelete: {
      type: Boolean,
      default: false
    },
    showExpand: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    picture() {
      return this.image ? `${process.env.VUE_APP_S3_HOST}/${this.image}` : null;
    },
    imageCss() {
      return `url("${this.picture}")`;
    }
  },
  methods: {
    onEdit() {
      if (!this.disabled) {
        this.$emit("edit");
      }
    },
    onDelete() {
      if (!this.disabled) {
        this.$emit("delete");
      }
    },
    onExpand() {
      if (!this.disabled) {
        this.$emit("expand");
      }
    }
  }
};
</script>
