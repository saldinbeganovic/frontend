<template>
  <div :style="wrapperStyles">
    <!-- display width/heigt -->
    <div class="mo-video-player" :style="containerStyle">
      <b-alert v-if="showMessage" class="mo-alert__light text-center" show>
        {{ message }}
        <span v-if="message2">
          <br />
          {{ message2 }}</span
        >
      </b-alert>
      <template v-else-if="videoSrc">
        <span
          class="mo-video-player__loader spinner-border spinner-border"
          role="status"
        />
        <!-- video width/height  -->
        <video
          ref="video"
          class="w-100 h-100 mo-video mo-video-player__video"
          :style="videoStyle"
          :autoplay="autoplay"
          @canplay="onVideoLoadEnded"
        >
          <source :src="videoSrc" type="video/mp4" />
          <p>Your browser doesn't support HTML5 video.</p>
        </video>
      </template>
      <mo-upload-file
        v-else
        dropzone-id="video-dropzone"
        title="Drag and drop to upload your video!"
        class="mo-dropzone h-100 d-flex justify-content-center align-items-center"
        accept="video/*"
        :max-files="1"
        @added="onAddFile"
      />
    </div>
    <div class="mo-video-player__controls-wrapper">
      <button @click.prevent="onTogglePlay" class="mr-2">
        <i v-if="isPaused" class="fas fa-play"></i>
        <i v-else class="fas fa-pause"></i>
      </button>
      <button @click.prevent="onToggleMute" class="mr-2">
        <i v-if="isMuted" class="fas fa-volume-mute"></i>
        <i v-else class="fas fa-volume"></i>
      </button>
      <template v-if="!noRotateControls">
        <button @click.prevent="onRotateLeft" class="mr-2">
          <i class="fas fa-undo"></i>
        </button>
        <button
          @click.prevent="onRotateRight"
          style="transform: scaleX(-1)"
          class="mr-2"
        >
          <i class="fas fa-undo"></i>
        </button>
      </template>
      <button @click.prevent="onFullScreen">
        <i class="fas fa-expand-wide"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "MoVideoPlayer",
  props: {
    videoPath: {
      type: String,
      default: null
    },
    playerOrientation: {
      type: Number,
      default: 0
    },
    initialOrientation: {
      type: Number,
      default: 0
    },
    showMessage: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: null
    },
    message2: {
      type: String,
      default: null
    },
    height: {
      type: Number,
      default: 350
    },
    width: {
      type: Number,
      default: 500
    },
    noRotateControls: {
      type: Boolean,
      default: false
    },
    objectFit: {
      type: String,
      default: "unset"
    },
    autoplay: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isPaused: !this.autoplay,
      isMuted: false,
      videoFile: null,
      videoWidth: null,
      videoHeight: null,
      orientation: 0,
      videoStyle: {
        borderRadius: "10px",
        transition: "0.5s ease all",
        transform: "none",
        objectFit: this.objectFit
      }
    };
  },
  watch: {
    orientation(value) {
      this.onRotate(value);
    }
  },
  computed: {
    videoBlob() {
      const URL = window.URL || window.webkitURL;
      return this.videoFile ? URL.createObjectURL(this.videoFile) : null;
    },
    videoSrc() {
      return this.videoPath
        ? `${process.env.VUE_APP_S3_HOST}/${this.videoPath}`
        : this.videoBlob;
    },
    wrapperStyles() {
      return {
        "margin-bottom": "50px",
        display: "flex",
        position: "relative",
        alignItems: "center",
        height: [90, 270].includes(this.playerOrientation)
          ? `${this.width + 6}px`
          : "unset"
      };
    },
    containerStyle() {
      return {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: `${this.height + 6}px`,
        width: `${this.width + 6}px !important`,
        transform: `rotate(${this.playerOrientation}deg)`,
        background: "black"
      };
    },
    getOrientation() {
      const n = this.orientation;
      return n < 0 ? 3 : n % 4;
    },
    videoRatio() {
      const o = this.getOrientation;
      if (this.videoHeight > this.videoWidth) {
        return o === 0 || o === 2 ? 1 : this.width / this.height;
      } else {
        return o === 1 || o === 3
          ? this.height > this.width
            ? this.width / this.height
            : this.height / this.width
          : 1;
      }
    }
  },
  methods: {
    onRotate(o) {
      this.videoStyle.transform = `rotate(${o * 90}deg) scale(${
        this.videoRatio
      })`;
    },
    onVideoLoadEnded() {
      const { videoWidth, videoHeight } = this.$refs.video;
      this.videoWidth = videoWidth;
      this.videoHeight = videoHeight;
      if (videoHeight > videoWidth) {
        this.videoStyle.height = `${this.height}px !important`;
      } else {
        this.videoStyle.width = `${this.width}px !important`;
      }
      // set default rotation
      this.onRotate(this.orientation);
    },
    onAddFile(file) {
      this.videoFile = file;
      this.$emit("added", file);
    },
    onTogglePlay() {
      const { video } = this.$refs;
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
      this.isPaused = video.paused;
    },
    onToggleMute() {
      const { video } = this.$refs;
      video.muted = !video.muted;
      this.isMuted = video.muted;
    },
    onRotateLeft() {
      this.onRotate(this.orientation--);
      this.$emit("rotate-left");
    },
    onRotateRight() {
      this.onRotate(this.orientation++);
      this.$emit("rotate-right");
    },
    onFullScreen() {
      window.open(this.videoSrc, "_blank");
    }
  }
};
</script>
