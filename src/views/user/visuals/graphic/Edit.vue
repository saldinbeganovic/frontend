<template>
  <form @submit.prevent="onSubmit" class="h-100 w-100">
    <mo-dashboard-body :loading="isLoading">
      <template #body>
        <mo-progress-modal
          modal-id="loading-progress-modal"
          title="Your file is uploading"
          :value="loadingPercentage"
          :description="loadingDescription"
          @cancel="onCancelUpload"
        />
        <b-col class="h-100">
          <b-row v-if="isNew" style="height: 400px">
            <mo-upload-file
              dropzone-id="fileUpload"
              ref="fileUpload"
              :max-files="1"
              accept="*"
              api-endpoint="/api/graphic-files"
              :body-fields="uploadBody"
              :auto-process="false"
              @success="onUploadSuccess"
              @added="onFileAdded"
            />
          </b-row>
          <b-row v-else>
            <b-col>
              <mo-image
                v-if="isImage(path)"
                width="100%"
                :image="path"
                :disabled="true"
                no-edit
              />
              <mo-video-player
                width="100%"
                v-else-if="isVideo"
                :video-path="path"
                no-rotate-controls
              />
              <a v-else target="_blank" :href="fileSrc">Graphics preview</a>
            </b-col>
          </b-row>
          <b-row class="mt-4">
            <b-col>
              <b-form-group class="w-100" label="Title" label-for="title">
                <b-form-input
                  id="title"
                  v-model="title"
                  class="mo-input__light-sm"
                  placeholder="Title"
                  type="text"
                  required
                ></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>
      </template>
      <template #footer-left>
        <mo-button v-if="path" title="Download" outline @click="onDownload" />
      </template>
      <template #footer-right>
        <mo-button
          v-if="isNew && $store.getters.hasAdminRole"
          type="submit"
          title="Save"
          :loading="isSubmitting"
        />
        <mo-button
          v-else-if="$store.getters.hasAdminRole"
          type="submit"
          title="Update"
          :loading="isSubmitting"
        />
      </template>
    </mo-dashboard-body>
  </form>
</template>

<script>
import {
  getGraphic,
  getGraphicFile,
  updateGraphic
} from "@/api/user/campaigns/graphics";
import MoVideoPlayer from "@/components/pure/MoVideoPlayer";
import { uploadCampaignGraphic } from "@/api/user/campaigns/campaigns";

export default {
  name: "Graphic",
  components: { MoVideoPlayer },
  data() {
    return {
      isSubmitting: false,
      isLoading: false,
      loadingPercentage: 0,
      showAnotherButton: false,
      showNextButton: false,
      title: "",
      path: null,
      file: null
    };
  },
  props: {
    graphicId: {
      required: true
    }
  },
  computed: {
    loadingDescription() {
      return "Uploading graphics ...";
    },
    isVideo() {
      const videoTypes = ["mp4", "mov", "mkv"];
      return videoTypes.includes(this.fileType(this.path));
    },
    graphicData() {
      return {
        title: this.title
      };
    },
    uploadBody() {
      return [
        { key: "title", value: this.title },
        { key: "company_id", value: this.$store.getters.companyId }
      ];
    },
    isNew() {
      return this.graphicId === "new";
    },
    fileSrc() {
      return `${process.env.VUE_APP_S3_HOST}/${this.path}`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onFileAdded(file) {
      this.file = file;
      this.title = file.name;
    },
    onCancelUpload() {
      this.$refs.cancel("cancelled");
      this.loadingPercentage = 0;
      this.$bvToast.toast("Graphic upload cancelled!", { variant: "info" });
      this.$bvModal.hide("loading-progress-modal");
    },
    onDownload() {
      getGraphicFile(this.graphicId).then(response => {
        let objectUrl = window.URL.createObjectURL(response.data);
        let anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = `${this.title}.${this.fileType(this.path)}`;
        anchor.click();
        window.URL.revokeObjectURL(objectUrl);
      });
    },
    onUploadSuccess(file, response) {
      this.$bvToast.toast("Upload successful!");
      this.isLoading = false;
      this.$store.commit("addGraphic", response);
      if (this.$route.path === "/user/campaign/graphic/new") {
        this.$router.back();
      }
    },
    onSubmit() {
      if (this.isNew) {
        if (!this.file) {
          this.$bvToast.toast("Please choose a file!", { variant: "danger" });
          return;
        }
        this.$bvModal.show("loading-progress-modal");
        const formData = new FormData();
        formData.append("title", this.title);
        formData.append("company_id", this.$store.getters.companyId);
        formData.append("file", this.file);
        this.isSubmitting = true;
        const { response, cancel } = uploadCampaignGraphic(
          formData,
          progress => {
            this.loadingPercentage = progress;
          }
        );
        this.$refs.cancel = cancel;
        response
          .then(res => {
            this.onUploadSuccess(this.file, res.data);
          })
          .catch(e => {
            this.$bvToast.toast(e.response.data.message, { variant: "danger" });
          })
          .finally(() => {
            this.isSubmitting = false;
            this.$bvModal.hide("loading-progress-modal");
            this.$emit("upload-finished");
          });
      } else {
        this.handleUpdate(
          updateGraphic(this.graphicId, this.graphicData),
          "Graphic"
        );
      }
    },
    fetchData() {
      if (!this.isNew) {
        this.handleFetch(getGraphic(this.graphicId)).then(data => {
          this.path = data.path;
          this.title = data.title;
        });
      }
    }
  }
};
</script>
