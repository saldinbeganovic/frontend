<template>
  <div>
    <mo-prompt-modal
      modal-id="delete-video-modal"
      message="Do you want to delete this video ?"
      @right="onDelete"
    />
    <validation-observer class="h-100 flex-grow-1" v-slot="{ handleSubmit }">
      <form
        class="d-flex flex-column justify-content-between h-100"
        @submit.prevent="handleSubmit(onSubmit)"
      >
        <mo-dashboard-body :loading="isLoading">
          <template #body>
            <mo-progress-modal
              modal-id="loading-progress-modal"
              title="Your video is uploading"
              :value="loadingPercentage"
              :description="loadingDescription"
              @cancel="onCancelUpload"
            />
            <b-col>
              <b-row>
                <b-alert v-if="isRotating" class="mo-alert__info" show>
                  Video's rotation is currently being processed, the result will
                  be visible shortly.
                </b-alert>
              </b-row>
              <b-row class="mb-3 d-flex align-items-center">
                <mo-video-player
                  :video-path="videoPath"
                  :show-message="!isNew && !videoPath && !isLoading"
                  :initial-orientation="orientation"
                  :width="700"
                  :height="395"
                  object-fit="contain"
                  message="Video preview is not available just yet, because video upload is still pending,"
                  message2="please wait a few minutes..."
                  @added="onFileAdded"
                  @rotate-left="onRotateLeft"
                  @rotate-right="onRotateRight"
                />
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
                <b-col>
                  <b-form-group class="w-100" label="Brand" label-for="brand">
                    <b-form-select
                      id="brand"
                      v-model="brandId"
                      :options="brands"
                      text-field="name"
                      value-field="id"
                      class="mo-input__light-sm"
                      required
                    ></b-form-select>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-form-group class="w-100" label="Notes" label-for="notes">
                    <b-form-textarea
                      id="notes"
                      v-model="notes"
                      class="mo-input__light-sm"
                      placeholder="Notes"
                      type="text"
                      rows="2"
                    >
                    </b-form-textarea>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col v-if="!isNew" class="col-6">
                  <b-form-group label="Filesize" label-for="size">
                    <b-form-input
                      id="size"
                      v-model="filesize"
                      class="mo-input__light-sm"
                      placeholder="Size"
                      disabled
                      type="text"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col v-if="!isNew" class="col-6">
                  <b-form-group label="Created at" label-for="createdAt">
                    <b-form-input
                      id="createdAt"
                      v-model="createdDate"
                      class="mo-input__light-sm"
                      placeholder="Size"
                      disabled
                      type="text"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-col>
          </template>
          <template #footer-left>
            <mo-button
              v-if="!isNew && canDeleteVideo"
              title="Delete"
              variant="danger"
              @click="$bvModal.show('delete-video-modal')"
            />
            <b-form-select  v-if="isNew" v-model="compression" :options="options">
            
            </b-form-select>
           
            
          </template>
          
          <template #footer-right>
          
            <mo-button
              v-if="isNew"
              type="submit"
              title="Upload"
              :loading="isSubmitting"
            />
            <mo-button
              v-else-if="canUpdateVideo"
              type="submit"
              title="Update"
              :loading="isSubmitting"
            />
            
          </template>
        </mo-dashboard-body>
      </form>
    </validation-observer>
  </div>
</template>

<script>
import { getAuthUser } from "@/api/authentication";
import { formatDate } from "@/utils/utils";
import {
  createVideo,
  deleteVideo,
  getVideo,
  getVideoMetadata,
  updateVideo
} from "@/api/user/video/video";
import MoVideoPlayer from "@/components/pure/MoVideoPlayer";

export default {
  name: "MoEditVideo",
  components: { MoVideoPlayer },
  props: {
    videoId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      brands: [],
      brandId: null,
      isLoading: true,
      isSubmitting: false,
      loadingPercentage: 0,
      currentUser: null,
      unitItems: [],
     
      videoFile: null,
      videoPath: null,
      videoSize: null,
      archivedComment: null,
      videoCreatedAt: null,
      isProcessing: false,
      isArchived: false,
      unitId: null,
      title: "",
      notes: "",
      orientation: 0,
      pos: [],
      interval: null,
      // ratio of video height/width
      videoRatio: 1,
      videoContainerHeight: 350, // in pixels
      compression: 'default',
        options: [
          { value: 'default', text: 'Compression Level' },
          { value: '32', text: 'High' },
          { value: '30', text: 'Normal' },
          { value: '25', text: 'Low' },
        ],
        changeVid: 'default',
         
      videoStyle: {
        borderRadius: "10px",
        maxHeight: "30vh",
        transition: "0.5s ease all",
        transform: "none",
        
      },
      cancel: null
    };
  },
  computed: {
    getPosRequestData() {
      return {
        is_archived: 0,
        without_units: 0,
        has_player: 1
      };
    },
    createdDate() {
      return this.isNew ? false : formatDate(this.videoCreatedAt, true);
    },
    filesize() {
      return this.isNew ? false : this.formatBytes(this.videoSize);
    },
    isRotating() {
      return this.isProcessing && this.videoPath;
    },
    canUpdateVideo() {
      return this.$store.getters.hasAdminRole;
    },
    canDeleteVideo() {
      return this.$store.getters.hasAdminRole;
    },
    loadingDescription() {
      return `Uploading video ...`;
    },
    isNew() {
      return this.videoId === "new";
    },
    videoData() {
      return {
        title: this.title,
        orientation: this.orientation,
        brand_id: this.brandId,
        notes: this.notes
      };
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    
    onSubmit() {
      if (this.isNew) {
        this.onCreate();
      } else {
        this.onUpdate();
      }
    },
    onCancelUpload() {
      this.$refs.cancel("cancelled");
      this.loadingPercentage = 0;
      this.$bvToast.toast("Video upload cancelled!", { variant: "info" });
      this.$bvModal.hide("loading-progress-modal");
    },
    onCreate() {
      this.isSubmitting = true;
      this.$bvModal.show("loading-progress-modal");
      const formData = new FormData();
      formData.append("title", this.title);
      formData.append("notes", this.notes);
      formData.append("company_id", this.companyId);
      formData.append("brand_id", this.brandId);
      formData.append("file", this.videoFile);
      formData.append("compression", this.compression);
      formData.append("orientation", this.orientation);
      const { response, cancel } = createVideo(formData, progress => {
        this.loadingPercentage = progress;
      });
      this.$refs.cancel = cancel;
      response
        .then(res => {
          this.$bvToast.toast("Video created");
          this.onCreated(res.data.id);
        })
        .catch(e => {
          if (e.message === "cancelled") return;
          this.$bvToast.toast(`Video creation error!`, { variant: "danger" });
        })
        .finally(() => {
          this.isSubmitting = false;
          this.$bvModal.hide("loading-progress-modal");
        });
    },
    onUpdate() {
      this.handleUpdate(updateVideo(this.videoId, this.videoData), "Video");
    },
    onDelete() {
      this.$bvModal.hide("delete-video-modal");
      this.handleDelete(deleteVideo(this.videoId), "Video", true).then(() => {
        this.onBack();
      });
    },
    onFileAdded(file) {
      // if the title field is empty set (default) title to filename
      if (this.title.replaceAll(" ", "").length === 0) {
        this.title = file.name;
      }
      this.videoFile = file;
      console.log(this.videoFile);
    },
    onRotateRight() {
      this.orientation += 1;
      this.orientation = this.getOrientation(this.orientation);
    },
    onRotateLeft() {
      this.orientation -= 1;
      this.orientation = this.getOrientation(this.orientation);
    },
    getOrientation(n) {
      return n < 0 ? 3 : n % 4;
    },
    setVideoCheckInterval() {
      if (!this.isNew)
        if (!this.videoPath || this.isProcessing) {
          this.interval = setInterval(
            function() {
              this.fetchVideoUrl();
            }.bind(this),
            2000
          );
        }
    },
    fetchVideoUrl() {
      //because the url is the same, we need to reset the videoPath, to assing the new rotated video.
      if (this.isProcessing) {
        this.videoPath = null;
      }
      getVideo(this.videoId).then(video => {
        this.videoPath = video.path;
        this.isProcessing = video.is_processing;
        this.videoSize = video.size;
        if (this.videoPath && !this.isProcessing) {
          clearInterval(this.interval);
        }
      });
    },
    fetchData() {
      this.handleFetch(
        Promise.all([
          getAuthUser(),
          this.isNew ? null : getVideo(this.videoId),
          getVideoMetadata(this.$store.getters.companyId),       
        ])
      ).then(([user, video, metadata]) => {
        this.currentUser = user;
        this.brands = metadata.brands;
        if (!this.isNew) {
          this.brandId = video.brand_id;
          this.title = video.title;
          this.notes = video.notes;
          this.videoPath = video.path;
          this.videoSize = video.size;
          this.videoCreatedAt = video.created_at;
          this.isProcessing = video.is_processing;
          this.archivedComment = video.archived_comment;
          this.isArchived = video.archived_at ? true : false;
          if (!this.videoPath || this.isProcessing) {
            this.setVideoCheckInterval();
          }
        }
      });
    },
    onBack() {
      this.$emit("exit");
    },
    onCreated(id) {
      this.$emit("created", id);
    }
  }
};
</script>
