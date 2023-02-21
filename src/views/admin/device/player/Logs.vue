<template>
  <mo-dashboard-body>
    <template #body>
      <mo-prompt-modal
        modal-id="delete-log-modal"
        message="Remove selected logs ?"
        @right="onDeleteLog"
      />
      <mo-table
        empty-text="No logs to show"
        :fields="fields"
        :items="items"
        :loading="isLoading"
        id="log-table"
        @edit="onEdit"
        @select="selected = $event"
        style="max-height:500px !important; margin-bottom: 20px;"
      >
        <template #cell(path)="{item}">
          <a target="_blank" :href="getLogUrl(item.path)">{{
            formatLogPath(item.path)
          }}</a>
        </template>
      </mo-table>
    </template>
    <template #footer-left>
      <div class="wrapper" >
      <mo-button class="mr-2" title="Record log" @click="onRecordLog" />
      
      <template v-if="selected.length > 0">
        <mo-button
          title="Delete"
          @click="$bvModal.show('delete-log-modal')"
          variant="danger"
        />
      </template>
      <span  :class="loader()"></span>
    </div>
    </template>
  </mo-dashboard-body>
</template>
<script>
import { formatDate } from "@/utils/utils";
import {
  deletePlayerLog,
  getPlayerLogs,
  takePlayerLog
} from "@/api/admin/device/player";

export default {
  name: "Logs",
  data() {
    return {
      isLoading: false,
      btnClicked:0,
      oldLenghtArray: 0,
      newLenghtArray: 0,
      items: [],
      selected: [],
      itemsFake: [],
      loaderSpin: false,
      fields: [
        { key: "select", label: "" },
        { key: "path", label: "View" },
        {
          key: "created_at",
          label: "Created at",
          formatter: value => formatDate(value, true, false, true)
        }
      ]
    };
  },
  computed: {
    posId() {
      return this.$route.params.posId;
    },
    companyId() {
      return this.$route.params.companyId;
    },
    playerId() {
      return this.$route.params.playerId;
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
    onRecordLog() {
      this.btnClicked++;
      var interval= undefined;
      if(this.btnClicked%2==0){
        this.loaderSpin = false;
      }
      else{
      takePlayerLog(this.playerId)
        .then(() => {
          this.loaderSpin=true;
          this.$bvToast.toast(
            "Player log is being recorded. This should take a few seconds"
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
              "Player log is recorded"
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
    onEdit() {
      this.$router.push(
        `/${this.companyPathPrefix}/pos/${this.posId}?unitId=${this.unitId}`
      );
    },
    onDeleteLog() {
      this.$bvModal.hide("delete-log-modal");
      Promise.all(this.selected.map(id => deletePlayerLog(this.playerId, id)))
        .then(() => {
          this.$bvToast.toast(`Removed ${this.selected.length} logs!`);
          this.fetchData();
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    },
    fetchData() {
      this.isLoading = true;
      getPlayerLogs(this.playerId)
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
      getPlayerLogs(this.playerId)
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
    formatLogPath(value) {
      return value.split("/")[2];
    },
    getLogUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    }
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
#log-table{
 max-height:500px !important; 
 margin-bottom: 20px;
}
</style>