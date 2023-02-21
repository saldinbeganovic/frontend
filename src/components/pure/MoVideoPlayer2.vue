<template>
  <div :style="wrapperStyles">
    <!-- display width/heigt -->
    <div class="mo-video-player" :style="containerStyle">
      <b-alert v-if="showMessage" class="mo-alert__light text-center" show>
        {{ message }}
        <span v-if="message2">
          <br />
          {{ message2 }}</span
        >
      </b-alert>
      <template v-if="videoSrc">
        <span
          class="mo-video-player__loader spinner-border spinner-border"
          role="status"
        />
        <!-- video width/height  -->
        <video
          ref="video"
          class="w-100 h-100 mo-video mo-video-player__video"
          :style="videoStyle"
          :autoplay="autoplay"
          @canplay="onVideoLoadEnded"
          :src="videoPrev"
          id="video"
          loop
        >
          
          <p>Your browser doesn't support HTML5 video.</p>
        </video>
      </template>
      
    </div>
    <div class="mo-video-player__controls-wrapper">
      <button @click.prevent="onTogglePlay" class="mr-2">
        <i v-if="isPaused" class="fas fa-play"></i>
        <i v-else class="fas fa-pause"></i>
      </button>
      <button @click.prevent="onToggleMute" class="mr-2">
        <i v-if="isMuted" class="fas fa-volume-mute"></i>
        <i v-else class="fas fa-volume"></i>
      </button>
      <template v-if="!noRotateControls">
        <button @click.prevent="onRotateLeft" class="mr-2">
          <i class="fas fa-undo"></i>
        </button>
        <button
          @click.prevent="onRotateRight"
          style="transform: scaleX(-1)"
          class="mr-2"
        >
          <i class="fas fa-undo"></i>
        </button>
      </template>
      <button @click.prevent="onFullScreen">
        <i class="fas fa-expand-wide"></i>
      </button>
    </div>
    
    <div class="triangle-right2"><div class="triangle-right2-back"></div></div>
    
    <div class="triangle-right"><div class="triangle-right-back"></div></div>
    
        <draggable v-model="list"
        drag-class="dragging-item"
        @dragstart="dragStartHandler"
        @change="finish"
        >
      <transition-group tag="div"  class="grid mo-video-player__controls-wrapper2" name="grid" style="bottom: -155px; height: 90px !important; " >
        <div class="behindCell "  @click="createBlob(item.id)" v-for="item in list" :key="item" >
          <div class="cell inner-card">
        <mo-upload-playlist-5
          
        :dropzone-id="ajdi+item.id"
        
        title=""
        class="mo-dropzone"
        accept="video/*"
        :max-files="1"
        :uploadMultiple="false"
        :parallel="5"
        @added="onAddFile"
        @removed="onRemoveFile"
        @change="onChangeBlob()"
      />
    </div>
    <p id="dropText">DROP HERE!</p>
       </div>

      </transition-group>
    </draggable>
    
 
 
  </div>
</template>

<script>
  
// eslint-disable-next-line no-unused-vars
import draggable from 'vuedraggable';

export default {
  name: "MoVideoPlayer",
  order: 1,
  props: {
    videoPath: {
      type: String,
      default: null
    },
    playerOrientation: {
      type: Number,
      default: 0
    },
    initialOrientation: {
      type: Number,
      default: 0
    },
    showMessage: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: null
    },
    message2: {
      type: String,
      default: null
    },
    height: {
      type: Number,
      default: 350
    },
    width: {
      type: Number,
      default: 500
    },
    noRotateControls: {
      type: Boolean,
      default: false
    },
    objectFit: {
      type: String,
      default: "unset"
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    playlistVideos:{
      type: Array,
      
    }
    
  },
  components: {
    draggable,
  },
  data() {
    return {
      list: [
        {
          id:1,video:''
        },
        {
          id:2,video:''
        },
        {
          id:3,video:''
        },
        {
          id:4,video:''
        },
        {
          id:5,video:''
        }
      ],
      isPaused: !this.autoplay,
      isMuted: false,
      videoFiles:[],
      scaleFactor: 0.25,
      videoPrev: null,
      listThumbnails: [],
      blob_id:0,
      tamneil:"eeasd112332",
      videoWidth: null,
      videoHeight: null,
      ajdi:"video-dropzone",
      orientation: 0,
      videoStyle: {
        borderRadius: "10px",
        transition: "0.5s ease all",
        transform: "none",
        objectFit: this.objectFit,
        dragPreview: null,
      x: 0,
      y: 0
      }
    };
  },
  watch: {
    orientation(value) {
      this.onRotate(value);
    }
  },
  mounted(){
  

    var test = this.$el.querySelector(".inputContainervideo-dropzone1");
    test.firstElementChild.setAttribute('id', 'file1');
    test.firstElementChild.setAttribute('name', 'files[]');
    var test2 = this.$el.querySelector(".inputContainervideo-dropzone2");
    test2.firstElementChild.setAttribute('id', 'file2');
    test2.firstElementChild.setAttribute('name', 'files[]');
    var test3 = this.$el.querySelector(".inputContainervideo-dropzone3");
    test3.firstElementChild.setAttribute('id', 'file3');
    test3.firstElementChild.setAttribute('name', 'files[]');
    var test4 = this.$el.querySelector(".inputContainervideo-dropzone4");
    test4.firstElementChild.setAttribute('id', 'file4');
    test4.firstElementChild.setAttribute('name', 'files[]');
    var test5 = this.$el.querySelector(".inputContainervideo-dropzone5");
    test5.firstElementChild.setAttribute('id', 'file5');
    test5.firstElementChild.setAttribute('name', 'files[]');
    
    //
    var dropzone1= document.getElementById("video-dropzone1");
    var dropzone2= document.getElementById("video-dropzone2");
    var dropzone3= document.getElementById("video-dropzone3");
    var dropzone4= document.getElementById("video-dropzone4");
    var dropzone5= document.getElementById("video-dropzone5");
  

    dropzone1.addEventListener('change', function() {
      var d1 = dropzone1.querySelector('.dz-preview');
      d1.firstElementChild.setAttribute('id', 'videoBlock');
      var video = document.createElement('video');
      video.autoplay = false;
      
      var getSrc= document.getElementById("video");
      video.src=getSrc.src;
      var box = document.getElementById("videoBlock");
      box.removeChild(box.firstElementChild);
      box.appendChild(video);
      video.setAttribute('class', 'videoBlockImage');
    });

    dropzone2.addEventListener('change', function() {
      var d2 = dropzone2.querySelector('.dz-preview');
      d2.firstElementChild.setAttribute('id', 'videoBlock2');
      var video2 = document.createElement('video');
      video2.autoplay = false;
      
      var getSrc2= document.getElementById("video");
      video2.src=getSrc2.src;
      var box2 = document.getElementById("videoBlock2");
      box2.removeChild(box2.firstElementChild);
      box2.appendChild(video2);
      video2.setAttribute('class', 'videoBlockImage');
    });
    dropzone3.addEventListener('change', function() {
      var d3 = dropzone3.querySelector('.dz-preview');
      d3.firstElementChild.setAttribute('id', 'videoBlock3');
      var video3 = document.createElement('video');
      video3.autoplay = false;
     
      var getSrc3= document.getElementById("video");
      video3.src=getSrc3.src;
      var box3 = document.getElementById("videoBlock3");
      box3.removeChild(box3.firstElementChild);
      box3.appendChild(video3);
      video3.setAttribute('class', 'videoBlockImage');
    });
    dropzone4.addEventListener('change', function() {
      var d4 = dropzone4.querySelector('.dz-preview');
      d4.firstElementChild.setAttribute('id', 'videoBlock4');
      var video4 = document.createElement('video');
      video4.autoplay = false;
      
      var getSrc4= document.getElementById("video");
      video4.src=getSrc4.src;
      var box4 = document.getElementById("videoBlock4");
      box4.removeChild(box4.firstElementChild);
      box4.appendChild(video4);
      video4.setAttribute('class', 'videoBlockImage');
    });
    dropzone5.addEventListener('change', function() {
      var d5 = dropzone5.querySelector('.dz-preview');
      d5.firstElementChild.setAttribute('id', 'videoBlock5');
      var video5 = document.createElement('video');
      video5.autoplay = false;
      
      var getSrc5= document.getElementById("video");
      video5.src=getSrc5.src;
      var box5 = document.getElementById("videoBlock5");
      box5.removeChild(box5.firstElementChild);
      box5.appendChild(video5);
      video5.setAttribute('class', 'videoBlockImage');
    });
    //
    var mouseIsDown = false;
    var idTimeout;
    var texts = document.querySelectorAll("#dropText");
    var cells =document.querySelectorAll(".behindCell");
    
    window.addEventListener('mousedown', function() {
  mouseIsDown = true;
  idTimeout = setTimeout(function() {
    if(mouseIsDown) {
      cells.forEach((cell) => {
        cell.setAttribute('id', 'behindCell');
       
    });
   
    texts.forEach((text) => {
      
        text.style.opacity=1;
      
    });
     
    }else{
      cells.forEach((cell) => {
        cell.removeAttribute('id', 'behindCell');
    });
    texts.forEach((text) => {
        text.style.opacity=0;
    });
    }
  }, 400);

});

window.addEventListener('mouseup', function() {
  clearTimeout(idTimeout);
  mouseIsDown = false;
  cells.forEach((cell) => {
        cell.removeAttribute('id', 'behindCell');
    });
    texts.forEach((text) => {
        text.style.opacity=0;
    });
});
    

  },
  computed: {
   
    
    videoBlob() {
      const URL = window.URL || window.webkitURL;
      
      
      
      //console.log(URL.createObjectURL(this.videoFiles[0]));
      var lastVideoFile =this.videoFiles[Object.keys(this.videoFiles).pop()];
    
      
      return lastVideoFile ? URL.createObjectURL(lastVideoFile) : null;
      
    },
    videoSrc() {
       
          return this.videoPath
          ? `${process.env.VUE_APP_S3_HOST}/${this.videoPath}`
          : this.videoBlob;
        
        //
        
      
      
    },
    wrapperStyles() {
      return {
        "margin-bottom": "50px",
        display: "flex",
        position: "relative",
        alignItems: "center",
        height: [90, 270].includes(this.playerOrientation)
          ? `${this.width + 6}px`
          : "unset"
      };
    },
    containerStyle() {
      return {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: `${this.height + 6}px`,
        width: `${this.width + 6}px !important`,
        transform: `rotate(${this.playerOrientation}deg)`,
        background: "black"
      };
    },
    getOrientation() {
      const n = this.orientation;
      return n < 0 ? 3 : n % 4;
    },
    videoRatio() {
      const o = this.getOrientation;
      if (this.videoHeight > this.videoWidth) {
        return o === 0 || o === 2 ? 1 : this.width / this.height;
      } else {
        return o === 1 || o === 3
          ? this.height > this.width
            ? this.width / this.height
            : this.height / this.width
          : 1;
      }
    }
  },
  methods: {
    finish () {
  
  var texts = document.querySelectorAll("#dropText");
    var cells =document.querySelectorAll(".behindCell");
    cells.forEach((cell) => {
        cell.removeAttribute('id', 'behindCell');
    });
    texts.forEach((text) => {
        text.style.opacity=0;
    });
    var file="fejk";
    var ajdi=this.list;
    this.$emit("added", file, ajdi);
},
    dragStartHandler() {
      
    },
    onChangeBlob(){
      this.videoPrev= this.videoSrc;
    },
    createBlob(id){
      var videoBlob;
      var objIndex = this.list.findIndex((obj => obj.id == id));
      
      
      
      
         videoBlob= URL.createObjectURL(this.list[objIndex].video);
       
        this.videoPrev = videoBlob;
      
      
        this.playlistVideos = this.list.map(a => ({...a}));
      
    },
    onRotate(o) {
      this.videoStyle.transform = `rotate(${o * 90}deg) scale(${
        this.videoRatio
      })`;
    },
    onVideoLoadEnded() {
      const { videoWidth, videoHeight } = this.$refs.video;
      this.videoWidth = videoWidth;
      this.videoHeight = videoHeight;
      if (videoHeight > videoWidth) {
        this.videoStyle.height = `${this.height}px !important`;
      } else {
        this.videoStyle.width = `${this.width}px !important`;
      }
      // set default rotation
      this.onRotate(this.orientation);
    },
    onRemoveFile(file, id){
      console.log("reduced to atoms..");
      
      var objIndex = this.list.findIndex((obj => obj.id == id));
     
      this.list[objIndex].video = "";
      var ajdi=this.list;
      this.$emit("added", file, ajdi);
    },
    onAddFile(file,id) {
      
      this.videoPrev=URL.createObjectURL(file);
      
      
    


      
      var objIndex = this.list.findIndex((obj => obj.id == id));
     
      this.list[objIndex].video = file;
      this.videoFiles.push( file);
      this.blob_id=id;
      this.playlistVideos = this.list.map(a => ({...a}));
      
      var ajdi = this.list;
       
      this.$emit("added", file, ajdi);
   
    },
   
    onTogglePlay() {
      const { video } = this.$refs;
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
      this.isPaused = video.paused;
    },
    onToggleMute() {
      const { video } = this.$refs;
      video.muted = !video.muted;
      this.isMuted = video.muted;
    },
    onRotateLeft() {
      this.onRotate(this.orientation--);
      this.$emit("rotate-left");
    },
    onRotateRight() {
      this.onRotate(this.orientation++);
      this.$emit("rotate-right");
    },
    onFullScreen() {
      window.open(this.videoPrev, "_blank");
    }
  }
};

</script>
<style>
  #dropText{
    padding-top: 9px;
    opacity: 0;
    text-align: center;
    color:rgb(0, 0, 0);
    font-size: 12px;
    cursor: grab;
    border: 1px dashed rgba(0, 0, 0, 0.719);
    border-top:none;
  }
  #behindCell{
    
   background-color: rgba(0, 0, 0, 0.034);
  }
  .behindCell{
   
  
  
  height:100px !important;
  width: 133px !important;
  min-height: 30px !important;

  }
.grid {
  grid-template-columns:auto auto auto auto auto;
  display: inline-grid;
  column-gap: 5px;
  background-color: rgba(238, 238, 238, 0.589);
  padding: 7px;;
}
.grid-move {
  transition: all 0.3s;
}
.inner-card{
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(216, 216, 216, 0.8);
  padding: 5px;
  text-align: center;
  height:70px !important;
  width: 133px !important;
  min-height: 30px !important;
 cursor: grab;
}
.sortable-chosen #dropText{
  opacity: 0;
}
.sortable-chosen .inner-card{
  cursor: grabbing;

}
.sortable-chosen .dz-remove{
  opacity: 0 !important;
}
.sortable-chosen .dz-image{
  background: black !important; 
}
.sortable-chosen .videoBlockImage{
  transition: opacity 1s, filter 1s;
  
  opacity: 0.4;
  filter:saturate(140%);
}
.sortable-ghost{
  cursor: grabbing;
}
.inner-card .mo-text__light{
  font-size: 40px !important;
  padding-top: 15px;
}
.inner-card h3{
  display: none;
}
.inner-card .dropzone {
    position: relative;
    display: inline-block;
    vertical-align: middle !important;
    margin: 0px !important;
    height: 55px !important;
    width: 119px !important;
    min-height: 10px !important;
}
.inner-card .dropzone .dz-preview {
    position: relative;
    display: inline-block;
    vertical-align: middle !important;
    margin: 0px !important;
    height: 72px !important;
    width: 133px !important;
    min-height: 10px !important;
    padding: 2px;
}
.inner-card .dropzone.dz-clickable * {
    cursor: grab !important;
}
.inner-card .dropzone .dz-preview.dz-file-preview .dz-image {
    border-radius: 2px;
    background: #999;
    background: linear-gradient(to bottom, #eee, #ddd);
}
.inner-card .dropzone .dz-preview .dz-details {
    z-index: 20;
    
    /* left: 0; */
  
    /* min-width: 100%; */
    /* max-width: 100%; */
   
}

.inner-card .vue-dropzone>.dz-preview .dz-details {
    top: 1px  !important;
    left: 1px !important;
    color: #fff;
    padding: 2px !important;
    padding-top: 30px !important;
    /*background-color: rgba(33, 243, 138, 0.8) !important;*/
    height: 67px !important;
    width: 132px !important;
    transition: opacity .2s linear;
    text-align: left;
}
.inner-card .dropzone .dz-preview.dz-file-preview .dz-image {
    border-radius: 20px;
    background: #999;
    height: 70px !important;
    width: 133px !important;
    background: linear-gradient(to bottom, #eee, #ddd);
}
.inner-card .vue-dropzone>.dz-preview .dz-error-mark, .vue-dropzone>.dz-preview .dz-success-mark {
    margin-left: auto;
    margin-top: auto;
    width: 20px !important;
    top: 20px !important;
    right: 60.5px !important;
}
.inner-card .dropzone .dz-preview .dz-error-mark svg {
    display: block;
    width: 30px !important;
    height: 30px !important;
}
.inner-card .dropzone .dz-preview .dz-details .dz-size {
    opacity: 0 !important;
}
.inner-card .dropzone .dz-preview.dz-error:hover .dz-error-message {
  opacity: 0 !important;
    pointer-events: auto;
}
.inner-card .dropzone .dz-preview .dz-details .dz-filename {
    opacity: 0 !important;
}
.inner-card .dropzone .dz-preview.dz-error .dz-error-message {
  opacity: 0 !important;
}
.inner-card .inner-card .dropzone .dz-preview.dz-error .dz-error-mark {
     opacity: 0 !important;
    -webkit-animation: slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);
    animation: slide-in 3s;
    opacity: 0 !important;}
.inner-card .dropzone .dz-preview.dz-error .dz-error-mark {
  opacity: 0 !important;
    -webkit-animation: slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);
    animation: slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);
}
.inner-card .vue-dropzone>.dz-preview .dz-remove {
    position: absolute;
    z-index: 30;
    color: rgb(87, 87, 87) !important;
    background-color: rgb(245, 245, 245) !important;
    margin-left: 15px;
    padding: 3px !important;
    top: inherit;
    bottom: 75px !important;
    border: 2px solid rgba(226, 226, 226, 0.589) !important;
    text-decoration: none;
    border-bottom: none !important;
    text-transform: uppercase;
    font-size: 10px !important;
    font-weight: bold !important;
    letter-spacing: 1px !important;
    opacity: 0;
    width: 100px !important;
    height: 25px !important;
}

.drag-el{
  padding: 20px;
  background-color: red;
}
.list-group-item {
  padding: 5px 10px;
  cursor: grab !important;
}
.behindChos {
    position: relative;
    display: inline-block;
    vertical-align: middle !important;
    margin: 0px !important;
    height: 70px !important;
    width: 133px !important;
    min-height: 10px !important;
}
.inner-card .dropzone .dz-preview.dz-file-preview .dz-image {
    border-radius: 2px !important;
    background: #999;
    height: 65px !important;
    width: 130px !important;
    background: linear-gradient(to bottom, #eee, #ddd);
}
.inner-card .dropzone .dz-preview.dz-file-preview .dz-details {
     opacity: 0;
}
.canvas{
  height: 67px !important;
    width: 132px !important;
}
.inner-card .dropzone .dz-preview.dz-file-preview .dz-image {
    border-radius: 0px !important;
    background-color: rgb(0, 0, 0) !important;
    height: 70px !important;
    width: 131px !important;
    background: linear-gradient(to bottom, #eee, #ddd);
    padding-top: 1px;
    padding-bottom: 1px;
}
.videoBlockImage{
height: 85px !important;
width: 140px !important;
position: absolute;
top: 50%;
left: 50%;
-webkit-transform: translateX(-50%) translateY(-50%);
-moz-transform: translateX(-50%) translateY(-50%);
-ms-transform: translateX(-50%) translateY(-50%);
-o-transform: translateX(-50%) translateY(-50%);
transform: translateX(-50%) translateY(-50%);
background-color: black;
}
.triangle-right {
	width: 0;
	height: 0;
	border-top: 12px solid transparent;
	border-left: 9px solid rgba(226, 226, 226, 0.589);
	border-bottom: 12px solid transparent;
  bottom: -123px;
  position: absolute;
  z-index: 94;
}
.triangle-right-back{
  width: 0;
	height: 0;
	border-top: 10px solid transparent;
	border-left: 8px solid rgb(255, 255, 255);
	border-bottom: 10px solid transparent;
  bottom: -9px;
  left: -10px;
  position: absolute;
  z-index: 95;
}
.triangle-right2 {
	width: 0;
	height: 0;
	border-top: 12px solid transparent;
	border-left: 12px solid rgba(226, 226, 226, 0.589);
	border-bottom: 12px solid transparent;
  bottom: -120px;
  right: -9px;
  position: absolute;
  z-index: 94;
  outline:#999 1px;
}
.triangle-right2-back{
  width: 0;
	height: 0;
	border-top: 8px solid transparent;
	border-left: 8px solid #F5F5F5;
	border-bottom: 8px solid transparent;
  bottom: -8px;;
  right: 4px;
  position: absolute;
  z-index: 95;
}

</style>
