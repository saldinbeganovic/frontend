<template>
  <vue-dropzone
    :id="dropzoneId"
    ref="dropzone"
    class="mo-dropzone h-100 d-flex justify-content-center align-items-center"
    :options="dropzoneOptions"
    :useCustomSlot="true"
    @vdropzone-file-added="onDropzoneFileAdded"
    @vdropzone-success="onDropzoneSuccess"
    @vdropzone-sending="onDropzoneSending"
    @vdropzone-removed-file="onDropzoneFileRemoved"
  >
    <div class="dropzone-custom-content">
      <i
        class="mb-3 fal fa-cloud-upload mo-text__light"
        style="font-size: 200px"
      />
      <h3 class="dropzone-custom-title mo-text__light">{{ title }}</h3>
      <div class="subtitle mo-text__light" style="font-size: 18px">
        {{ subtitle }}
      </div>
    </div>
  </vue-dropzone>
</template>

<script>
import VueDropzone from "vue2-dropzone";
import { getAccessToken } from "@/utils/auth";

export default {
  name: "AddGraphic",
  components: {
    VueDropzone
  },
  props: {
    dropzoneId: {
      type: String,
      default: "dropzone"
    },
    title: {
      type: String,
      default: "Click to open file explorer on your computer"
    },
    subtitle: {
      type: String,
      default: "...or drag and drop a file in this region."
    },
    bodyFields: {
      type: Array,
      default: () => []
    },
    accept: {
      type: String,
      default: "image/*"
    },
    apiEndpoint: {
      type: String,
      default: "/"
    },
    autoProcess: {
      type: Boolean,
      default: true
    },
    maxFiles: {
      type: Number,
      default: null
    },
    clickable: {
      type: Boolean,
      default: true
    },
    initialFiles: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fileCount: 0,
      fileUploadCount: 0,
      dropzoneOptions: {
        url: `${process.env.VUE_APP_API_HOST}${this.apiEndpoint}`,
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        },
        acceptedFiles: this.acceptFiles,
        thumbnailWidth: 200,
        addRemoveLinks: this.clickable,
        autoProcessQueue: this.autoProcess,
        maxFiles: this.maxFiles,
        maxFileSize: null,
        clickable: this.clickable
      }
    };
  },
  computed: {
    searchRegex() {
      return new RegExp(
        this.accept.replaceAll("/", "\\/").replaceAll("*", ".*")
      );
    },
    acceptFiles() {
      return this.accept === "video/*" ? "*" : this.accept;
    }
  },
  mounted() {
    this.initialFiles
      .filter(e => e.path && (e.title || e.name))
      .forEach(file =>
        this.addFile({ name: file.title || file.name }, file.path)
      );
  },
  methods: {
    processQueue() {
      this.$refs.dropzone.processQueue();
    },
    onDropzoneFileAdded(file) {
      if (this.fileCount >= this.maxFiles) {
        this.$bvToast.toast(`Can't upload more than ${this.fileCount} files!`, {
          variant: "info"
        });
        this.$refs.dropzone.removeFile(file);
        return;
      }
      if (!this.validate(file)) {
        this.$refs.dropzone.removeFile(file);
        return this.$bvToast.toast(
          "Invalid file type selected, try another one!",
          {
            variant: "danger"
          }
        );
      }
      this.fileCount++;
      this.$emit("added", file);
      // emit only the added filename
      this.$emit("added-filename", file.name);
    },
    validate(file) {
      // must add a special check if the filename ends with .mkv,
      // because mime type property is empty
      const parts = file.upload.filename.split(".");
      if (this.accept === "video/*" && parts[parts.length - 1] === "mkv") {
        return true;
      } else {
        return this.searchRegex.test(file.type);
      }
    },
    onDropzoneFileRemoved(file) {
      this.fileCount--;
      this.$emit("removed", file);
    },
    onDropzoneSuccess(file, response) {
      this.fileUploadCount++;
      this.$emit("success", file, response);
      // emit only the path of the uploaded file
      this.$emit("success-path", response.message);
      if (this.fileUploadCount === this.fileCount) {
        // all files were uploaded
        this.$emit("success-all", this.fileCount);
      }
    },
    onDropzoneSending(file, xhr, formData) {
      this.bodyFields.forEach(field => {
        formData.append(field.key, field.value);
      });
    },
    addFile(file, url) {
      this.$refs.dropzone.manuallyAddFile(
        file,
        `${process.env.VUE_APP_S3_HOST}/${url}`
      );
    }
  }
};
</script>
