<template>
  <mo-dashboard-body body-class="justify-content-center">
    <template #body>
      <mo-prompt-modal
        modal-id="delete-screenshot-modal"
        :message="modalMessage"
        @right="onDeleteScreenshot"
      />
      <div
        v-if="isLoading"
        class="w-100 d-flex justify-content-center mo-text__primary"
      >
        <b-spinner label="Loading ..."></b-spinner>
      </div>
      <span v-if="items.length === 0 && !isLoading" class="w-100 text-center"
        >No screenshots to show</span
      >
      <mo-video-card
        v-else
        v-for="screenshot in items"
        :key="screenshot.id"
        class="mb-3 mx-3"
        type="log"
        edit-button-icon="fa fa-expand-arrows"
        :checked="Boolean(selected[screenshot.id])"
        :title="formatDate(screenshot.created_at)"
        :thumbnail="screenshot.path"
        @edit="onViewScreenshot(screenshot.path)"
        @checked="onChecked(screenshot, $event)"
      />
    </template>
    <template #footer-left>
      <div class="wrapper" >
      <mo-button
        class="mr-2"

        title="Take screenshot"
        @click="onTakeScreenshot"
      />
      
      <mo-button
        v-if="selectedItems.length > 0"
        variant="danger"
        title="Delete"
        @click="$bvModal.show('delete-screenshot-modal')"
      />
      <span :class="loader()"></span>
    </div>
    </template>
  </mo-dashboard-body>
</template>

<script>
import MoVideoCard from "@/components/pure/MoVideoCard";
import {
  deletePlayerScreenshot,
  getPlayerScreenshots,
  takePlayerScreenshot
} from "@/api/admin/device/player";
import { formatDate } from "@/utils/utils";

export default {
  name: "Videos",
  components: {
    MoVideoCard
  },
  data() {
    return {
      btnClicked:0,
      oldLenghtArray: 0,
      newLenghtArray: 0,
      loaderSpin: false,
      isLoading: true,
      isSubmitting: false,
      selected: {},
      items: [],
      itemsFake: [],
    };
  },
  computed: {
    playerId() {
      return this.$route.params.playerId;
    },
    selectedItems() {
      return Object.keys(this.selected);
    },
    modalMessage() {
      return `Are you sure you want to delete ${this.selectedItems.length} screenshots ?`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    loader(){
        if(this.loaderSpin){
          return "loader"
        }
        else{
          return "loader hideLoader"
        }
      },
    onTakeScreenshot() {
      this.btnClicked++;
      var interval= undefined;
      if(this.btnClicked%2==0){
        this.loaderSpin = false;
      }
      else{
        
      
      takePlayerScreenshot(this.playerId)
        .then(() => {
          this.loaderSpin=true;
          this.$bvToast.toast(
            "Player screenshot is being recorded. This should take a few seconds"
          );

          this.oldLenghtArray = this.items.length;
             interval= setInterval(() => {
            this.fetchFakeData();
            this.newLenghtArray = this.itemsFake.length;
           
            if(this.oldLenghtArray != this.newLenghtArray){
              this.loaderSpin=false;
              this.btnClicked=0;
              clearInterval(interval);
              this.fetchData();
            this.$bvToast.toast(
              "Player screenshot is recorded"
            );
          }

          }, 3000);
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
          clearInterval(interval);
            this.loaderSpin=false;
        });
      }
    },
    formatDate(value) {
      return formatDate(value, true, false, true);
    },
    onChecked(video, isChecked) {
      if (isChecked) {
        this.$set(this.selected, video.id, isChecked);
      } else {
        this.$delete(this.selected, video.id);
      }
    },
    onViewScreenshot(url) {
      window.open(`${process.env.VUE_APP_S3_HOST}/${url}`, "_blank");
    },
    onDeleteScreenshot() {
      this.$bvModal.hide("delete-screenshot-modal");
      
      Promise.all(
        this.selectedItems.map(id => deletePlayerScreenshot(this.playerId, id))
      )
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        })
        .finally(() => {
          this.$set(this, "selected", {});
          this.fetchData();
        });
    },
    fetchData() {
      this.isLoading = true;
      getPlayerScreenshots(this.playerId)
        .then(data => {
          this.items = data;
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    fetchFakeData() {
      getPlayerScreenshots(this.playerId)
        .then(data => {
          this.itemsFake = data;
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  }
};
</script>
<style>
.hideLoader{
    opacity:0 !important;
  }
  .loader {
  width: 48px;
  height: 48px;
  display: inline-block;
  position: relative;
  opacity: 1;
  margin-left:5px;
  margin-right:5px;
}
.loader::after,
.loader::before {
  content: '';  
  box-sizing: border-box;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgb(0, 0, 0);
  position: absolute;
  left: 0;
  top: 0;
  animation: animloader 2s linear infinite;
}
.loader::after {
  animation-delay: 1s;
}

@keyframes animloader {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
