<template>
  <button
    :title="title"
    @click="onClick"
    class="mo-video-card d-flex flex-column justify-content-between p-0 mt-2 mb-2"
  >
    <div
      class="mo-video-card__body d-flex align-items-center justify-content-center w-100 position-relative"
      
    >
   
      <b-form-checkbox
        v-if="!hideCheckbox"
        class="mo-video-card__checkbox"
        v-model="checkboxValue"
        id="customCss"
        
        name="check-button" 
      />
      <span v-if="!hideCheckbox">
      <span class="boxBehind" v-if="checked" ><i id="square1" class=" far fa-check-square"></i></span>
      <span class="boxBehind" v-else ><i id="square2" class="fa-solid fa-square-check"></i></span>
    </span>
      <b-button
        v-if="!hideEditButton"
        class="mo-video-card__edit p-0 mo-table__edit"
         style="z-index: 2;"
        @click="$emit('edit')"
      >
        <i :class="editButtonIcon" />
      </b-button>
      <div
        v-if="videoThumbnail"
        class="mo-video-card__thumbnail h-100 w-100 d-flex align-items-center"
      >
        <video
          v-if="videoSrc"
          ref="video"
          class="w-100 mo-video"
          loop
          muted
          autoplay
          playsinline
        >
          <source :src="videoSrc" type="video/mp4" />
          <p>Your browser doesn't support HTML5 video.</p>
        </video>
      </div>
      <div
        v-else-if="thumbnail && !imageError"
        class="d-flex justify-content-center align-items-center mo-video-card__thumbnail w-100"
      >
        <img
          @error="imageError = true"
          :src="thumbnailPath"
          height="100%"
          width="100%"
          :style="{
            objectFit: height > width ? 'contain' : 'cover'
          }"
        />
      </div>
      <i v-else :class="`fas ${iconClass} mx-5 my-3`" />
      <span  v-if="size" class="mo-video-card__size font-weight-bold">{{
        parsedSize
      }}</span>
      <span v-if="duration" class="mo-video-card__duration font-weight-bold">{{
        parsedDuration
      }}</span>

      <span
        v-if="isProcessing"
        class="mo-video-card__processing font-weight-bold"
        ><i style="color: yellow" class="fas fa-exclamation-triangle "></i> This
        {{ type }} is currently processing.</span
      >
    </div>
    <div class="mo-video-card__footer px-3 py-2 d-flex justify-content-between">
      <span class="mo-video-card__cut-text">{{ title }}</span>
    </div>
  </button>
</template>

<script>
export default {
  name: "MoVideoCard",
  props: {
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String
    },
    videoThumbnail: {
      type: String
    },
    checked: {
      type: Boolean
    },
    hideEditButton: {
      type: Boolean,
      default: false
    },
    hideCheckbox: {
      type: Boolean,
      default: false
    },
    editButtonIcon: {
      type: String,
      default: "fas fa-edit"
    },
    duration: {
      type: Number
    },
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      
      default: 0
    },
    isProcessing: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number
    }
  },
  data() {
    return {
      imageError: false,
      maxTitleLength: 15,
      checkboxValue: this.checked
    };
  },
  watch: {
    checked(value) {
      this.checkboxValue = value;
    },
    checkboxValue(value) {
      this.$emit("checked", value);
    }
  },
  computed: {
    parsedSize() {
      return this.formatBytes(this.size, 0);
    },
    parsedDuration() {
      const format = value => (value < 10 ? `0${value}` : value);
      const hours = Math.floor(this.duration / 60 / 60);
      const minutes = Math.floor((this.duration - hours * 60 * 60) / 60);
      const seconds = Math.floor(this.duration % 60);
      return `${hours ? `${format(hours)}:` : ""}${format(minutes)}:${format(
        seconds
      )}`;
    },
    videoSrc() {
      return this.videoThumbnail
        ? `${process.env.VUE_APP_S3_HOST}/${this.videoThumbnail}`
        : null;
    },
    iconClass() {
      if (this.type === "video") {
        return "fa-film";
      }
      if (this.type === "log") {
        return "fa-clipboard-list";
      }
      throw new Error("Invalid type in VideoCard");
    },
    thumbnailPath() {
      return `${process.env.VUE_APP_S3_HOST}/${this.thumbnail}`;
    }
  },
  methods: {
    onClick() {
      this.checkboxValue = !this.checkboxValue;
    },
   
  }
};
</script>
<style>
  .mo-video-card:hover .custom-checkbox{
    z-index: -3 !important;
    opacity: 0;
  }
  .mo-video-card .custom-checkbox{
    z-index: -3 !important;
  }
  .mo-video-card__checkbox {
    position: absolute;
    top: 10px !important;
    left: 10px !important;
}

#square1{
  
  font-size: 28px;
  position: absolute;
  top: -2px;
  left: -1px;
  
  z-index: 2;
}
#square2{
  font-size: 28px;
  position: absolute;
  top: -2px;
  left: -1px;
  
 z-index: 2;
}

.boxBehind{
  background-color: rgb(255, 255, 255);
  width: 23px;
  height: 23px;
  position: absolute;
  top: 11px;
  left: 11px;
  z-index: 1;
  border-radius: 5px;
  box-shadow: 0 0 5px #1b1b1b;
}
</style>
