<template>
  <div class="image-select__wrapper">
    <div>
      <mo-image
        :disabled="disabled"
        :show-delete="showDelete"
        :image="mainImage"
        :show-expand="isImage"
        preview-message="No image"
        height="320px"
        width="unset"
        @edit="$emit('edit-image')"
        @delete="$emit('delete-image')"
        @expand="$emit('expand-image')"
      />
    </div>
    <div
      :class="'image-select__inner-wrapper ' + requestPrefixInnerWrapperClass"
      @mousewheel="scrollY($event)"
    >
      <img
        @wheel.prevent
        @touchmove.prevent
        @scroll.prevent
        :src="toS3Url(image.path)"
        class="image-select__select"
        v-for="image in images"
        :key="image.id"
        @click.stop="onImageClick(image)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "MoImageSelect",
  props: {
    mainImage: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showDelete: {
      type: Boolean,
      default: false
    },
    images: {
      type: Array
    },
    requestPrefix: {
      type: String,
      default: "image-select-inner-wrapper"
    }
  },
  computed: {
    isImage() {
      return this.mainImage ? true : false;
    },
    previewModalName() {
      return `${this.requestPrefix}-image-modal`;
    },
    requestPrefixInnerWrapperClass() {
      return `${this.requestPrefix}-image-select-inner-wrapper`;
    }
  },
  methods: {
    onImageClick(image) {
      if (!this.disabled) this.$emit("image-selected", image);
    },
    scrollY(event) {
      let content = document.querySelector(
        `.${this.requestPrefixInnerWrapperClass}`
      );
      if (event.deltaY > 0) {
        content.scrollLeft += 30;
      } else {
        content.scrollLeft -= 30;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* width */
::-webkit-scrollbar {
  height: 10px;
  border-radius: 10px;
  position: absolute;
}

/* Track */
::-webkit-scrollbar-track {
  background: none;
}

/* Handle */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  height: 1px;
  background: rgba(0, 143, 204, 0.2);
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  border-radius: 4px;
  width: 1px;
  background: rgba(0, 143, 204, 0.4);
}
.image-select {
  &__wrapper {
    width: 100%;
  }
  &__inner-wrapper {
    overflow: auto hidden;
    display: flex;
    flex-direction: row;
  }
  &__select {
    display: inline-block;
    border: 1px solid;
    height: 80px;
    width: 67px;
    min-width: 67px;
  }
  &__select:hover {
    border: 2px solid gray;
  }
}
</style>
