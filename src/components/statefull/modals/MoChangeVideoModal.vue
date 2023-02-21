<template>
  <div>
    <mo-choose-video-modal
      :modal-id="chooseVideoModalId"
      @submit="onChooseVideoSubmit"
    />
    <mo-prompt-modal
      modal-id="video-submit-conformation-modal"
      :message="`Are you sure you want to schedule this video ?`"
      @right="onConfirmVideoSubmitConformation"
    />
    <mo-screen-wrapper-modal
      ref="videoPlayerPreview"
      #body="{props}"
      bodyClass="d-flex flex-wrap w-100 ml-auto mr-auto"
      :dialogClass="dialogClass"
    >
      <b-col>
        <b-row class="ml-auto mr-auto ">
          <b-col>
            <b-row>
              <h5 class="ml-auto mr-auto">Preview on display</h5>
            </b-row>
          </b-col>
        </b-row>
        <b-row class="ml-auto mr-auto">
          <b-col>
            <mo-video-player
              :video-path="props.videoPath"
              :width="props.width"
              :height="props.height"
              :object-fit="objectFit"
              :player-orientation="props.orientation"
              :no-rotate-controls="true"
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-row>
              <mo-button
                class="m-3 ml-auto "
                @click="onCancleVideoSubmit"
                title="Cancle"
              />
              <mo-button
                class="m-3 mr-auto"
                @click="onConfirmVideoSubmit"
                title="Change"
              />
            </b-row>
          </b-col>
        </b-row>
        <template v-if="videoPath">
          <b-row class="mt-3">
            <h5 class="ml-auto mr-auto">Currently playing</h5>
          </b-row>
          <b-row>
            <b-col>
              <mo-video-player
                :video-path="videoPath"
                :width="videoPlayerWidth"
                :height="videoPlayerHeight"
                :player-orientation="display.orientation"
                :no-rotate-controls="true"
                :object-fit="objectFit"
              />
            </b-col>
          </b-row>
          <b-row class="mt-2 float-right">
            <b-col>
              {{ currentPlayer.video.title }}
              <small>({{ formatBytes(currentPlayer.video.size) }})</small>
            </b-col>
          </b-row>
        </template>
      </b-col>
    </mo-screen-wrapper-modal>
    <mo-schedule-modal
      :modal-id="scheduleTimeModalId"
      @submit="onSubmitScheduleTime"
      @cancel="$bvModal.hide(scheduleTimeModalId)"
    />
    <mo-prompt-modal
      :modal-id="confirmScheduleModalId"
      message="Continue with scheduling ?"
      description="This action will replace everything that is currently playing on assigned players."
      @right="onSubmitSchedule"
    />
  </div>
</template>

<script>
import MoChooseVideoModal from "@/components/statefull/modals/MoChooseVideoModal";
import { scheduleVideo } from "@/api/admin/device/player";
import MoScheduleModal from "@/components/pure/modals/MoScheduleModal";
import { formatError } from "@/utils/utils";
//import { formatDate } from "@/utils/utils";

export default {
  name: "MoChangeVideoModal",
  components: { MoScheduleModal, MoChooseVideoModal },
  props: {
    currentPlayer: {
      required: true
    },
    display: {
      required: true
    }
  },
  data() {
    return {
      playerOptions: [],
      override: false,
      uniqueToken: null,
      tempVideo: null
    };
  },
  computed: {
    dialogClass() {
      return this.display
        ? [90, 270].includes(this.display.orientation)
          ? "orientation-width"
          : "w-auto"
        : "";
    },
    chooseVideoModalId() {
      return `${this.uniqueToken}_choose-video-modal`;
    },
    scheduleTimeModalId() {
      return `${this.uniqueToken}_schedule-time-modal`;
    },
    confirmScheduleModalId() {
      return `${this.uniqueToken}_confirm-schedule-modal`;
    },
    videoPlayerWidth() {
      if (this.display)
        return this.scaledVideoPlayerDimensions(
          this.display.width,
          this.display.height,
          this.display.orientation
        )[0];
      return null;
    },
    videoPlayerHeight() {
      if (this.display)
        return this.scaledVideoPlayerDimensions(
          this.display.width,
          this.display.height,
          this.display.orientation
        )[1];
      return null;
    },
    videoPlayerOrientation() {
      if (this.display) return this.display.orientation;
      return null;
    },
    videoPath() {
      if (!this.currentPlayer || !this.currentPlayer.video) {
        return null;
      }
      return this.currentPlayer.video.path;
    },
    objectFit() {
      return this.display.has_daisy_chain ? "fill" : "contain";
    }
  },
  mounted() {
    this.uniqueToken = `${Math.round(Math.random() * 1000)}`;
  },
  methods: {
    changeVideoLater() {
      this.isSchedulingVideoNow = false;
      this.$bvModal.show(this.chooseVideoModalId);
    },
    changeVideoNow() {
      this.isSchedulingVideoNow = true;
      this.$bvModal.show(this.chooseVideoModalId);
    },
    onSubmitScheduleTime(datetime) {
      this.dateTime = datetime;
      this.$bvModal.hide(this.scheduleTimeModalId);
      this.$bvModal.show(this.confirmScheduleModalId);
    },
    onSubmitSchedule() {
      this.isSubmitting = true;
      scheduleVideo({
        video_id: this.currentVideoId,
        players: [this.currentPlayer.id],
        scheduled_at: this.parseDatetime(this.dateTime),
        override: this.override,
        now: this.isSchedulingVideoNow
      })
        .then(() => {
          this.$bvToast.toast(
            `Video scheduled to player #${this.currentPlayer.id}.`
          );
          // cleanup: reset variables & hide modals
          this.dateTime = null;
          this.override = false;
          this.currentVideoId = null;
          this.$bvModal.hide(this.scheduleTimeModalId);
          // emit event when everything is done
          this.$emit("done");
        })
        .catch(e => {
          this.$bvToast.toast(formatError(e), { variant: "danger" });
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
    onChooseVideoSubmit(video) {
      this.tempVideo = video;
      this.$refs.videoPlayerPreview.show({
        width: this.videoPlayerWidth,
        height: this.videoPlayerHeight,
        orientation: this.videoPlayerOrientation,
        hasDaisyChain: this.display.has_daisy_chain,
        videoPath: video.path
      });
    },
    onCancleVideoSubmit() {
      this.$refs.videoPlayerPreview.hide();
    },
    onConfirmVideoSubmit() {
      this.$bvModal.show("video-submit-conformation-modal");
    },
    onConfirmVideoSubmitConformation() {
      this.currentVideoId = this.tempVideo.id;
      this.$refs.videoPlayerPreview.hide();
      this.$bvModal.hide(this.chooseVideoModalId);
      if (this.isSchedulingVideoNow) {
        this.onSubmitSchedule();
      } else {
        this.$bvModal.show(this.scheduleTimeModalId);
      }
    }
  }
};
</script>
<style lang="scss">
.mo-video-player {
  margin-left: auto;
  margin-right: auto;
}
</style>
