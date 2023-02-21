<template>
  <b-modal
    :id="modalId"
    class="mo-image-gallery-modal"
    content-class="mo-input-modal bgClass"
    body-class="mo-input-modal-body m-0"
    dialog-class="mo-image-gallery-modal__dialog"
    hide-footer
    hide-header
   
    centered
    @hide="onHide"
  >
 
    <b-row 
      rows="8"
      class="position-relative mo-image-gallery-modal__image-wrapper mb-2"
    >
      <b-col cols="1">
        <i
          v-if="showLeftArrow"
          class="fa fa-arrow-left mo-image-gallery-modal__left-arrow "
          @click="onNavigate(-1)"
        />
      </b-col>
      <b-col cols="10" class="d-flex">
        <img :src="mainImageSrc" alt="" id="imgSize" @change="changeSize()" /> </b-col
      ><b-col cols="1">
        <i
          v-if="showRightArrow"
          class="fa fa-arrow-right mo-image-gallery-modal__right-arrow "
          @click="onNavigate(1)"
        />
      </b-col>
    </b-row>
    <b-row  class="mt-3 holderAction"  >
      <span class="imageCount" v-if="album"> {{this.index+1}}/{{this.filterImages.length}}</span>
      <span class="imageDate" v-if="album">{{formatDateNew(this.filterImages[this.index].created_at)}}</span>
      <slot name="options" class="imageTrash" :item="filterImages[index]"></slot>
    </b-row>
    <b-row rows="3" class="mo-image-gallery-modal__slideshow-wrapper"  >
      <b-col
        v-for="(item, i) of filterImages "
        :class="
          `mo-image-gallery-modal__${i === index ? 'current-img' : 'img'}`
        "
        @click="onSwitchImage(i)"
        :key="i"
      >
        <img
          :src="toImageSrc(item.path)"
          :title="item.title"
          :alt="item.title"
        />
      </b-col>
    </b-row>
    <svg xmlns="http://www.w3.org/2000/svg" class="closeX" v-on:click="onClose" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
   
  </b-modal>
</template>

<script>
import axios from "axios";

export default {
  name: "MoImageGallery",
  props: {
    images: {
      type: Array,
      required: true
    },
    album: {
      type: Boolean,
      default: false
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    modalId: {
      type: String,
      default: "image-modal"
    }
  },
  data() {
    return {
      index: this.initialIndex,
      items: [],
    };
  },
  watch: {
    initialIndex(value) {
      this.index = value;
    }
    

  },
   mounted() {
    
   

    
  },
  computed: {
    filterImages() {
      return this.images.filter((e) =>{return e.path!=null});
    },
    showRightArrow() {
      console.log(this.filterImages);
  
      return this.index < this.filterImages.length - 1;
    },
    showLeftArrow() {
      return this.index > 0;
    },
    mainImageSrc() {
      return this.filterImages[this.index]
        ? this.toImageSrc(this.filterImages[this.index].path)
        : null;
    }
  },
  methods: {
    formatDateNew(value){
      const date = new Date(value);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    },
    changeSize(){
      console.log("changeSize");
    },
    toImageSrc(path) {
      return `${process.env.VUE_APP_S3_HOST}/${path}`;
    },
    onSwitchImage(index) {
      this.index = index;
    },
    onNavigate(step) {
      this.index += step;
    },
    onHide() {
      this.index = 0;
    },
    onClose() {
      //hide this modal
      this.$bvModal.hide(this.modalId);

      console.log("close");
     

    },
    onDownload() {
      axios
        .get(this.toImageSrc(this.items[this.index].path), {
          responseType: "blob",
          headers: {
            Authorization: ""
          }
        })
        .then(blob => {
          let objectUrl = window.URL.createObjectURL(blob);
          let anchor = document.createElement("a");
          anchor.href = objectUrl;
          anchor.download = this.fileName(this.items[this.index].path);
          anchor.click();
          window.URL.revokeObjectURL(objectUrl);
        });
    }
  }
};
</script>
<style lang="scss">
@import "../../../assets/scss/variables";
.closeX{
  position: absolute;
  color: red;
  height: 50px;
  width: 50px;
  top: 0;
  right: 0;
  cursor: pointer;
  path{
    transition: all 0.3s ease;
    fill: rgb(204, 204, 204);
  }
  &:hover {
    path{
      transition: all 0.3s ease;
    fill: $dark-grey;
  }
      
    }
}

.bgClass{
  background: #000000bd !important;
  border: none;
  height: 100%;
  border-radius:0px ;
  padding-bottom: 10px;
}
.mo-image-gallery-modal__dialog{
  margin-top: 0;
  
}
.mo-image-gallery-modal {
 
  &__dialog {
    
    max-width: 100% !important;
    max-height: 100% !important;
    width: 100% !important;
    height: 100% !important;
    
  }
  &__image-wrapper {
    width: 100%;
    img {
      max-height: 60vh;
      box-shadow: 0px 3px 43px -8px rgba(0,0,0,0.75);
-webkit-box-shadow: 0px 3px 43px -8px rgba(0,0,0,0.75);
-moz-box-shadow: 0px 3px 43px -8px rgba(0,0,0,0.75);
      margin: auto;
      
      object-fit: contain;
      border-radius: 16px;
    }
  }
  &__nav-arrow {
    cursor: pointer;
    font-size: 50px;
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    transition: 0.3s ease-in-out all;
    color: $primary;
    &:hover {
      color: $dark-grey;
    }
  }
  &__download {
    cursor: pointer;
    color:rgb(0, 131, 207);
  }
  &__left-arrow {
    @extend .mo-image-gallery-modal__nav-arrow;
    left: 0;
  }
  &__right-arrow {
    @extend .mo-image-gallery-modal__nav-arrow;
    right: 0;
  }
  &__img {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 5px !important;
    padding-right: 5px !important;
    cursor: pointer;
    img {
      width: 80px;
  height: 80px;
  background-size: cover;
  cursor: pointer;
  margin: 2px;
  border-radius: 3px;
  border: 1px solid lightgray;
  object-fit: cover;
      
    }
   
  }
  &__current-img {
    @extend .mo-image-gallery-modal__img;
    transition: scale 0.3s ease;
    scale: 1.12;
    margin-left: 5px !important;
    margin-right: 5px !important;
    img{
       
      transition: all 0.3s ease;
      border: 2.5px solid $primary;

    }
    
  }
}
.mo-image-gallery-modal__slideshow-wrapper{
  position: absolute;
  bottom: 0;
}
.tres{
  color:rgb(228, 2, 2);
}
#cover-image-modal{
  padding-left: 0px !important;
  overflow-y: hidden !important;
}
#gallery-modal{
  padding-left: 0px !important;
  overflow-y: hidden !important;
}
#preview-modal{
  padding-left: 0px !important;
  overflow-y: hidden !important;
}
#graphic-preview-modal{
  padding-left: 0px !important;
  overflow-y: hidden !important;
}
#graphic-and-files-preview-modal{
  padding-left: 0px !important;
  overflow-y: hidden !important;
}
.imageCount{
  color: rgb(168, 168, 168);

font-size: 18px;
}
.imageDate{
  color: rgb(219, 219, 219);

}
.tres{

  font-size: 18px;
}
.tres:hover{
  cursor: pointer;
  transition: color 0.3s;
  color: rgb(59, 59, 59);
}
.holderAction{
  display: flex;
  width: 450px;
  min-width: 225px;
    flex-wrap: nowrap;
    align-items: center;
    align-content: center;
    justify-content: space-between;
}
</style>
