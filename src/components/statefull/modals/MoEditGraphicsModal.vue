<template>
  <form @submit.prevent="onSubmit" class="w-100 h-100">
    <mo-dashboard-body :loading="isLoading" :is-footer-top="false">
      <template #body>
        <mo-progress-modal
          modal-id="loading-progress-modal"
          title="Your graphic is uploading"
          :value="loadingPercentage"
          @cancel="onCancelUpload"
        />
        <b-col class="h-100">
          <b-row style="height: 400px">
            <mo-upload-file
              dropzone-id="fileUpload"
              ref="fileUpload"
              accept="*"
              :max-files="1"
              :auto-process="false"
              @success="onUploadSuccess"
              @added="onFileAdded"
            />
          </b-row>
          <b-row class="mt-2">
            <b-col cols="4">
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
      <template #footer-right>
        <mo-button
          v-if="showAnotherButton"
          title="Add another"
          class="mr-2"
          @click="onAddAnother"
        />
        <template v-else>
          <mo-button
            title="Upload"
            type="submit"
            :loading="isLoading"
            :disabled="isLoading"
          />
        </template>
      </template>
    </mo-dashboard-body>
  </form>
</template>

<script>
import { uploadCampaignGraphic } from "@/api/user/campaigns/campaigns";

export default {
  name: "MoEditGraphicsModal",
  props: {
    campaignId: {
      type: String
    }
  },
  data() {
    return {
      loadingPercentage: 0,
      isLoading: false,
      showAnotherButton: false,
      showNextButton: false,
      title: "",
      file: null
    };
  },
  computed: {
    isNew() {
      return this.campaignId === "new";
    }
  },
  mounted() {
    if (this.$route.query.edit) {
      // alert the user before refreshing the page and losing form data
      window.onbeforeunload = function() {
        return "If you refresh this page the progress will be lost. Are sure you want to continue ?";
      };
    }
  },
  methods: {
    onFileAdded(file) {
      this.file = file;
      this.title = file.name;
    },
    onAddAnother() {
      this.$refs.fileUpload.$refs.dropzone.removeAllFiles();
      this.showAnotherButton = false;
      this.title = "";
      this.file = null;
    },
    onCancelUpload() {
      this.$refs.cancel("cancelled");
      this.loadingPercentage = 0;
      this.$bvToast.toast("Graphic upload cancelled!", { variant: "info" });
      this.$bvModal.hide("loading-progress-modal");
    },
    onUploadSuccess(file, response) {
      this.$emit("done");
      this.$bvToast.toast("Upload successful!");
      this.isLoading = false;
      this.$bvModal.hide("loading-progress-modal");
      this.$store.commit("addGraphic", response);
      this.$store.commit("addGraphicSizeMap", {
        [response.id]: {
          size: this.file.size,
          path: this.file.name
        }
      });
      this.showNextButton = true;
      this.showAnotherButton = true;
    },
    onSubmit() {
      if (!this.file) {
        this.$bvToast.toast("Please choose a file!", { variant: "danger" });
        return;
      }
      this.isLoading = true;
      this.$bvModal.show("loading-progress-modal");
      const formData = new FormData();
      formData.append("title", this.title);
      formData.append("company_id", this.$store.getters.companyId);
      formData.append("file", this.file);
      const { response, cancel } = uploadCampaignGraphic(formData, progress => {
        this.loadingPercentage = progress;
      });
      this.$refs.cancel = cancel;
      response
        .then(res => {
          this.onUploadSuccess(this.file, res.data);
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        })
        .finally(() => {
          this.isLoading = false;
          this.$bvModal.hide("loading-progress-modal");
          this.$emit("upload-finished");
        });
    }
  }
};
</script>
