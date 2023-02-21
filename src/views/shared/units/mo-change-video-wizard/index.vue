<template>
  <div>
    <mo-player-modal
      v-if="currentPlayer"
      modal-id="change-video-wizard-modal"
      :player="currentPlayer"
      :loading="isLoadingVideoChange"
      change-now-text="Cancle"
      change-later-text="Change"
      @change-later="onChangeVideo"
      @change-now="onCancleVideo"
    />
    <mo-picker-modal
      label="Player"
      message="Please, choose the display with a player you would like to access"
      modal-id="change-video-wizard-player-picker-modal"
      :entity-items="playerOptions"
      @submit-item="onPickPlayer"
    />
    <select-screen v-if="disabledTab == 0" @next="screenSelected" />

    <change-video
      v-else-if="disabledTab == 1"
      :unit="tempUnit"
      @exit="onExit"
      @selected-video="onSelectedVideo"
    />

    <!-- to preview the sceen when video is changing -->
    <mo-screen-wrapper-modal
      ref="videoplayerPreviewOnWizardModal"
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
              v-if="tempDisplay"
              :video-path="props.videoPath"
              :width="props.width"
              :height="props.height"
              :player-orientation="props.orientation"
              :no-rotate-controls="true"
              :object-fit="objectFit"
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
                @click="onChangeVideoSubmit"
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
                :width="props.width"
                :height="props.height"
                :player-orientation="props.orientation"
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

    <mo-prompt-modal
      modal-id="now-or-later-prompt-modal"
      :message="`When do you want to change the video ?`"
      rightOption="Now"
      leftOption="Later"
      rightOptionVariant=""
      @right="onChangeVideoNow"
      @left="onChangeVideoLater"
    />

    <mo-schedule-modal
      modal-id="schedule-time-modal"
      @submit="onSubmitScheduleTime"
      @cancel="$bvModal.hide('schedule-time-modal')"
    />
    <mo-prompt-modal
      modal-id="confirm-schedule-modal"
      message="Continue with scheduling ?"
      description="This action will replace everything that is currently playing on assigned players."
      @right="onSubmitSchedule"
    />
  </div>
</template>

<script>
import SelectScreen from "./SelectScreen";
import ChangeVideo from "./ChangeVideo";
import MoPlayerModal from "@/components/pure/modals/MoPlayerModal";
import { getVideo } from "@/api/user/video/video";
import { scheduleVideo } from "@/api/admin/device/player";
import MoScheduleModal from "@/components/pure/modals/MoScheduleModal";
import { formatError } from "@/utils/utils";
import MoPickerModal from "@/components/pure/modals/MoPickerModal";

export default {
  name: "ChangeVideoWizard",
  components: {
    SelectScreen,
    ChangeVideo,
    MoPlayerModal,
    MoScheduleModal,
    MoPickerModal
  },
  data() {
    return {
      tabIndex: 0,
      disabledTab: 0,
      isSchedulingVideoNow: false,
      isLoadingVideoChange: false,
      tempUnit: {},
      currentPlayer: null,
      tempDisplay: null,
      playerOptions: [],
      dateTime: null,
      override: false,
      currentVideoId: null
    };
  },
  computed: {
    tabItems() {
      return ["SelectScreen"];
    },
    dialogClass() {
      return this.display
        ? [90, 270].includes(this.display.orientation)
          ? "orientation-width"
          : "w-auto"
        : "";
    },
    videoPlayerWidth() {
      if (this.tempDisplay)
        return this.scaledVideoPlayerDimensions(
          this.tempDisplay.width,
          this.tempDisplay.height,
          this.tempDisplay.orientation
        )[0];
      return null;
    },
    videoPlayerHeight() {
      if (this.tempDisplay)
        return this.scaledVideoPlayerDimensions(
          this.tempDisplay.width,
          this.tempDisplay.height,
          this.tempDisplay.orientation
        )[1];
      return null;
    },
    videoPlayerOrientation() {
      if (this.tempDisplay) return this.tempDisplay.orientation;
      return null;
    },
    objectFit() {
      return this.tempDisplay.has_daisy_chain ? "fill" : "contain";
    },
    videoPath() {
      if (!this.currentPlayer || !this.currentPlayer.video) {
        return null;
      }
      return this.currentPlayer.video.path;
    }
  },
  methods: {
    async screenSelected(unit) {
      this.tempUnit = unit;
      const nPlayers = unit.unit.players.length;
      if (nPlayers > 1) {
        this.playerOptions = unit.unit.players.map(e => ({
          value: e.id,
          text: `${
            e.display ? e.display.producer + " - " + e.display.name : ""
          }`,
          data: e
        }));
        this.$bvModal.show("change-video-wizard-player-picker-modal");
      } else if (nPlayers === 1) {
        await this.setTempDisplayAndPlayer(
          unit.unit.players[0],
          unit.unit.players[0].display
        );
        this.$bvModal.show("change-video-wizard-modal");
      } else {
        this.$bvToast.toast(
          "Please assign a player to this unit, before editing it's video!",
          { variant: "info" }
        );
      }
    },
    setTempDisplayAndPlayer(player, display) {
      this.currentPlayer = player;
      this.tempDisplay = display;
      return true;
    },
    async onPickPlayer(playerItem) {
      await this.setTempDisplayAndPlayer(
        playerItem.data,
        playerItem.data.display
      );
      this.$bvModal.hide("change-video-wizard-player-picker-modal");
      this.$bvModal.show("change-video-wizard-modal");
    },
    onExit() {
      this.$emit("close-modal");
    },
    onCancleVideo() {
      this.$bvModal.hide("change-video-wizard-modal");
      this.onExit();
    },
    onChangeVideo() {
      this.$bvModal.hide("change-video-wizard-modal");
      this.disabledTab++;
    },
    onChangeVideoLater() {
      this.isSchedulingVideoNow = false;
      this.$bvModal.show("schedule-time-modal");
    },
    onChangeVideoNow() {
      this.isSchedulingVideoNow = true;
      this.onSubmitSchedule();
    },
    onChangeVideoDone() {
      this.$bvModal.hide(this.playerModalId);
    },
    onChangeVideoSubmit() {
      this.$refs.videoplayerPreviewOnWizardModal.hide();
      this.$bvModal.show("now-or-later-prompt-modal");
    },
    onSelectedVideo(videoId) {
      this.currentVideoId = videoId;
      getVideo(videoId).then(video => {
        this.$refs.videoplayerPreviewOnWizardModal.show({
          width: this.videoPlayerWidth,
          height: this.videoPlayerHeight,
          orientation: this.videoPlayerOrientation,
          videoPath: video.path
        });
      });
    },
    onCancleVideoSubmit() {
      this.$refs.videoplayerPreviewOnWizardModal.hide();
      this.onExit();
    },

    onSubmitScheduleTime(datetime) {
      this.dateTime = datetime;
      this.$bvModal.hide("schedule-time-modal");
      this.$bvModal.show("confirm-schedule-modal");
    },
    onSubmitSchedule() {
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
          this.$bvModal.hide("schedule-time-modal");
          // emit event when everything is done
          this.onExit();
        })
        .catch(e => {
          this.$bvToast.toast(formatError(e), { variant: "danger" });
        });
    }
  }
};
</script>
