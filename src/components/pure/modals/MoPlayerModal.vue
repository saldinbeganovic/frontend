<template>
  <b-modal
    :id="modalId"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body m-0"
    :dialog-class="dialogClass"
    hide-footer
    hide-header
    centered
  >
    <div class="player" v-if="player">
      <b-row>
        <h5 class="ml-auto mr-auto">Preview on display</h5>
      </b-row>
      <b-row>
        <b-col>
          <mo-video-player
            :show-message="!previewVideoPath"
            message="No video in queue!"
            :video-path="previewVideoPath"
            :width="videoPlayerWidth"
            :height="videoPlayerHeight"
            :player-orientation="display.orientation"
            :no-rotate-controls="true"
            :object-fit="objectFit"
          />
        </b-col>
      </b-row>
      <b-row v-if="previewVideoPath" class="mt-2 float-left">
          <b-col>
            {{ this.player.pendingVideoSchedule.video.title }} 
            <small>({{ formatBytes(this.player.pendingVideoSchedule.video.size) }})</small>
          </b-col>
        </b-row>
        <b-row v-if="previewVideoPath" class="mt-2 float-right">
          <b-col>
            <small>{{ formatDateNew(this.player.pendingVideoSchedule.video.created_at,false,false,true) }} </small>
         
          </b-col>
        </b-row>
        <br>
      <!-- <p >This player has no video assigned.</p> -->
      <b-row v-if="isAdmin">
        Please switch to Group dashboard to change videos.
      </b-row>
      
      <b-row v-else-if="previewVideoPath" class="customRow2">
        
        <b-col>
          <mo-button
            v-if="$store.getters.hasAdminRole"
            :loading="loading && isSchedulingNow"
            class="mt-2"
            width="220px"
            @click="$emit('change-now')"
            :title="changeNowText"
          />
        </b-col>
        <b-col>
          <mo-button
            v-if="$store.getters.hasAdminRole"
            :loading="loading && !isSchedulingNow"
            class="mt-2 "
            width="220px"
            @click="$emit('change-later')"
            :title="changeLaterText"
          />
        </b-col>
      </b-row>

      <b-row v-else class="customRow">
        
        <b-col>
          <mo-button
            v-if="$store.getters.hasAdminRole"
            :loading="loading && isSchedulingNow"
            class="mt-2"
            width="220px"
            @click="$emit('change-now')"
            :title="changeNowText"
          />
        </b-col>
        <b-col>
          <mo-button
            v-if="$store.getters.hasAdminRole"
            :loading="loading && !isSchedulingNow"
            class="mt-2 "
            width="220px"
            @click="$emit('change-later')"
            :title="changeLaterText"
          />
        </b-col>
      </b-row>
    
      <!--<template v-if="videoPath">-->
        <template v-if="videoPath">
        <b-row class="mt-3 kastom">
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
        <b-row v-if="player.video" class="mt-2 float-left">
          <b-col>
            {{ player.video.title }} 
            <small>({{ formatBytes(player.video.size) }})</small>
          </b-col>
        </b-row>
        <b-row v-if="player.video" class="mt-2 float-right">
          <b-col>
            <small>{{ formatDateNew(player.video.created_at,false,false,true) }} </small>
         
          </b-col>
        </b-row>
        <!--
        <b-row  class="mt-2 float-right">
          <b-col>
            </small>
          </b-col>
        </b-row>
        -->
      </template>
    </div>
  </b-modal>
</template>

<script>
 // import { formatDate } from "@/utils/utils";
export default {
  name: "MoPlayerModal",
  props: {
    player: {
      required: true
    },
    modalId: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      required: false
    },
    isSchedulingNow: {
      type: Boolean
    },
    isAdmin: {
      type: Boolean
    },
    changeNowText: {
      type: String,
      default: "Change now"
    },
    changeLaterText: {
      type: String,
      default: "Change later"
    }
  },
  methods:{
    formatDateNew(value){
      const date = new Date(value);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    }
  },
  computed: {
   
    dialogClass() {
      return this.player
        ? [90, 270].includes(this.display.orientation)
          ? "mo-image-modal__dialog orientation-width"
          : "mo-image-modal__dialog"
        : "mo-image-modal__dialog";
    },
    videoPlayerWidth() {
      return this.scaledVideoPlayerDimensions(
        this.display.width,
        this.display.height,
        this.display.orientation
      )[0];
    },
    display() {
      return this.player.display || {};
    },
    videoPlayerHeight() {
      return this.scaledVideoPlayerDimensions(
        this.display.width,
        this.display.height,
        this.display.orientation
      )[1];
    },
    videoPath() {
      if (!this.player || !this.player.video) {
        return null;
      }
      return this.player.video.path;
    },
    previewVideoPath() {
      if (!this.player) {
        return null;
      }
      if (!this.player.pendingVideoSchedule) {
        return null;
      }
      return this.player.pendingVideoSchedule.video.path;
    },
    objectFit() {
      return this.player.display.has_daisy_chain ? "fill" : "contain";
    }
  }
};
</script>
<style lang="scss">
.mo-image-modal__dialog {
  max-width: 700px !important;
}
.player{
  background-color: white;
  min-height: 450px;
}
.customRow{
  display: flex !important;
    flex-wrap: nowrap !important;
    position: relative;
    
}
.customRow2{
  display: flex !important;
    flex-wrap: nowrap !important;
    position: absolute;
    padding-left: 13px;
}
.kastom{
  padding-top: 50px;
}
</style>
