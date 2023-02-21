<template>
    <mo-dashboard-body >
      <template #body>
        <mo-prompt-modal
        modal-id="delete-speed-modal"
        message="Remove selected data ?"
        @right="onDeleteSpeed"
      />
       <div class="wrapper" >
        <mo-button
          class="mr-2"
          title="Network speed check"
          @click="onCheckSpeed"
          width="310px"
        />
        <template v-if="selected.length > 0">
        <mo-button
          title="Delete"
          @click="$bvModal.show('delete-speed-modal')"
          variant="danger"
        />
      </template>
        <span :class="loader()"></span>
     
      


      </div>
      <mo-table
        empty-text="No speed info to show"
        :fields="fields"
        :items="items"
        :loading="isLoading"
        id="speed-table"
        @edit="onEdit"
        @select="selected = $event"
        style="max-height:500px !important; margin-bottom: 20px;"
      >
      <template #cell(download)="{item}">
        {{item.download}}Mbps
      </template>
      <template #cell(upload)="{item}">
        {{item.upload}}Mbps
      </template>
      <template #cell(ping)="{item}">
        {{item.ping}}ms
      </template>
      <template #cell(rate)="{item}">
        <div id="allPr" :class="{ 'redC': getRate(item.download, item.upload)=='Slow', 'yellowC': getRate(item.download, item.upload)=='Average', 'softgreenC': getRate(item.download, item.upload)=='Good', 
        'greenC': getRate(item.download, item.upload)=='Excellent', 'blueC': getRate(item.download, item.upload)=='Superb'}">
          {{getRate(item.download, item.upload)}}
  </div>
        
      </template>

      
      </mo-table>
      <div class="upBtn">
        <mo-button
          class="mr-2"
          title="Reboot Player"
          @click="onRebootPlayer"
          width="290px"
          
        />
        <mo-button
          class="mr-2"
          title="Update Player"
          @click="onUpdatePlayer"
          width="290px"
          
        />
          <mo-button
          class="mr-2"
          title="SSH Start"
          @click="onSshPlayer"
          width="290px"
          
        />
        
        
      </div>
    </template>
    </mo-dashboard-body>
  </template>
  
  <script>
  
  import {
    updatePlayerRBPI, checkSpeed, getPlayerSpeed, deletePlayerSpeed, rebootPlayerRBPI, sshPlayerRBPI
  } from "@/api/admin/device/player";
  import { formatDate } from "@/utils/utils";

  export default {
    name: "RemoteActions",
    components: {
     
    },
    data() {
      return {
        isLoading: false,
        loaderSpin: false,
        btnClicked:0,
        oldLenghtArray: 0,
        newLenghtArray: 0,
        itemsFake: [],
        items: [
        {"id":1, "download":450, "upload":150, "ping":1, "created_at":"11.15.2022" },
        {"id":2, "download":10, "upload":2, "ping":12, "created_at":"10.15.2022" },
        {"id":3, "download":150, "upload":40, "ping":34, "created_at":"9.15.2022" },
        {"id":4, "download":250, "upload":50, "ping":64, "created_at":"8.15.2022" },
        {"id":5, "download":57, "upload":21, "ping":31, "created_at":"7.15.2022" },
        {"id":6, "download":35, "upload":10, "ping":22, "created_at":"6.15.2022" },
        {"id":7, "download":1, "upload":0.5, "ping":80, "created_at":"5.15.2022" },
        {"id":8, "download":80, "upload":0.5, "ping":50, "created_at":"5.15.2022" },
        {"id":9, "download":450, "upload":150, "ping":1, "created_at":"11.15.2022" },
        {"id":10, "download":10, "upload":2, "ping":12, "created_at":"10.15.2022" },
        {"id":11, "download":150, "upload":40, "ping":34, "created_at":"9.15.2022" },
        {"id":12, "download":250, "upload":50, "ping":64, "created_at":"8.15.2022" },
        {"id":13, "download":57, "upload":21, "ping":31, "created_at":"7.15.2022" },
        {"id":14, "download":35, "upload":10, "ping":22, "created_at":"6.15.2022" },
        {"id":15, "download":1, "upload":0.5, "ping":80, "created_at":"5.15.2022" },
        {"id":16, "download":80, "upload":0.5, "ping":50, "created_at":"5.15.2022" },
        ],
      selected: [],
      fields: [
        { key: "id", label: "ID" },
        { key: "select", label: "" },
        { key: "download", label: "Download" },
        { key: "upload", label: "Upload" },
        { key: "ping", label: "Ping" },
        {key:"rate", label:"Rate"},
        {
          key: "created_at",
          label: "Created at",
          formatter: value => formatDate(value, true, false, false)
        }
      ]
      };
    },
    computed: {
      playerId() {
        return this.$route.params.playerId;
      },
      
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
      getRate(itemd, itemu){
        var rated = "";
        var rateu = "";
        var rate="";
        if(itemd<=10){
          rated= "Slow";
        }else if(itemd>10 && itemd<=50){
          rated= "Average";
        }else if(itemd>50 && itemd<=100){
          rated= "Good";
        }else if(itemd>100 && itemd<=200){
          rated= "Excellent";
        }else if(itemd>200){
          rated= "Superb";
        }
        if(itemu<=2){
          rateu= "Slow";
        }else if(itemu>2 && itemu<=10){
          rateu= "Average";
        }else if(itemu>10 && itemu<=20){
          rateu= "Good";
        }else if(itemu>20 && itemu<=50){
          rateu= "Excellent";
        }else if(itemu>50){
          rateu= "Superb";
        }
        if(rated=="Slow" && rateu=="Slow"){
          rate="Slow";
        }else if(rated=="Average" || rateu=="Good"){
          rate="Average";
        }else if(rated=="Good" || rateu=="Average"){
          rate="Good";
        }else if(rated=="Excellent" || rateu=="Good"){
          rate="Excellent";
        }else if(rated=="Superb" || rateu=="Excellent" || rateu=="Superb"){
          rate="Superb";
        }
        return rate;
      },
      onRebootPlayer(){
        rebootPlayerRBPI(this.playerId)
          .then(() => {
            this.$bvToast.toast(
              "Player is rebooting. This should take a few seconds"
            );
          
          })
          .catch(e => {
            this.$bvToast.toast(e.response.data.message, { variant: "danger" });
          });
      },
      onSshPlayer(){
        sshPlayerRBPI(this.playerId)
          .then(() => {
            this.$bvToast.toast(
              "SSH connection is starting... This should take a few seconds"
            );
          
          })
          .catch(e => {
            this.$bvToast.toast(e.response.data.message, { variant: "danger" });
          });
      },
      onUpdatePlayer() {
        updatePlayerRBPI(this.playerId)
          .then(() => {
            this.$bvToast.toast(
              "Player is uploading. This should take a few seconds"
            );
          
          })
          .catch(e => {
            this.$bvToast.toast(e.response.data.message, { variant: "danger" });
          });
      },
      onCheckSpeed() {
        this.btnClicked++;
        var interval= undefined;
      if(this.btnClicked%2==0){
        this.loaderSpin = false;
      }
      else{
        checkSpeed(this.playerId)
          .then(() => {
            this.loaderSpin=true;
  
            this.$bvToast.toast(
              "Network speed check in proccess.. This should take a few seconds"
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
              "Network speed check completed"
            );
          }

          }, 5000);

            

          

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
      onDeleteSpeed() {
      this.$bvModal.hide("delete-speed-modal");
      Promise.all(this.selected.map(id => deletePlayerSpeed(this.playerId, id)))
        .then(() => {
          this.$bvToast.toast(`Removed ${this.selected.length} speed info!`);
          this.fetchData();
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    },
      fetchData() {
      this.isLoading = true;
      getPlayerSpeed(this.playerId)
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
      getPlayerSpeed(this.playerId)
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
.wrapper{
  display: flex;
  margin-bottom: 20px;
}
.redC{
  background-color:#FF6961;;
}
.yellowC{
  background-color:#FFB54C;
}
.softgreenC{
  background-color: #F8D66D;
}
.greenC{
  background-color: #7ABD7E;
}
.blueC{
  background-color: #7ed4d2;;
}
#allPr {
    line-height: 1.5;
    color: white;
    width: 110px;
    border-radius: 4px;
    padding: 5px;
    text-align: left;
 
    font-weight: 400;
    font-family: 'Montserrat', sans-serif;
   }
   .upBtn{
    padding-bottom: 12px;
    padding-top: 45px;
    position: relative;
    margin: auto;
   }
  #speed-table{
    max-height:500px !important; margin-bottom: 20px;
  }
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
</style>
  
