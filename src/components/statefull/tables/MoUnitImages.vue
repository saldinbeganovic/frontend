<template>
  <div class="w-100">
    <mo-prompt-modal
      modal-id="delete-image-modal"
      message="Are you sure you want to delete this image ? 
      (if the image is a cover photo the cover photo will also be removed)"
      @right="onDeleteImageConfirm"
    />
    <mo-prompt-modal
      modal-id="delete-unit-album-modal"
      message="Are you sure you want to delete this album? 
      (this action will also delete all the images in the album)"
      @right="onDeleteAlbumConfirm"
    />
    <mo-image-gallery
      modal-id="unit-images-gallery-modal"
      :initial-index="galleryIndex"
      :images="currentImages"
      :album=true
      class="cstmClassTest"
    >
      <template #options="{item}">
        <i
          v-if="item"
          class="fa fa-trash mo-image-gallery-modal__download ml-2 tres"
          style="font-size: 20px"
          @click="onDeleteImage(item.id)"
        />
      </template>
    </mo-image-gallery>
    <mo-table
      empty-text="No images to show"
      :fields="fields"
      :items="items"
      :loading="isLoading"
      :show-edit-button="false"
      :show-id-field="false"
      @select="selected = $event"
    >
      <template #cell(photos)="{item}">
        <img
          v-for="(photo, index) of item.photos.filter((e) =>{return e.path!=null}).slice(0, 3)"
          class="mr-2"
          style="cursor: pointer"
          :key="index"
          :alt="photo.title"
          :src="getImageUrl(photo.path)"
          @click="onViewImage(index, item.photos)"
        />
        <span v-if="item.photos.length > 3"
          >+ {{ item.photos.length - 3 }}</span
        >
      </template>
      <template #cell(add)="{item}">
       
       <i class="fa fa-plus addBtn" @click="onAdd(item)" />
       <i class="fa fa-trash trashBtn" @click="onDeleteAlbum(item)" />
    
   </template>
   <template #cell(created_at)="{item}">
    
    {{ formatDateNew(item.photos.slice(-1)[0].created_at) }}
 
</template>
    </mo-table>
  </div>
</template>
<script>
import { deleteUnitPhoto, getUnitPhotos } from "@/api/admin/company/unit/photo";
//import { formatDate } from "@/utils/utils";
import MoImageGallery from "@/components/pure/modals/MoImageGallery";

export default {
  name: "MoUnitImages",
  props: {
    posId: {
      type: [Number, String],
      required: true
    },
    unitId: {
      type: [Number, String],
      required: true
    },
    images: {
      type: Array
    }
  },
  components: { MoImageGallery },
  data() {
    return {
      currentImageId: null,
      isLoading: false,
      items: [],
      selected: [],
      currentImages: [],
      galleryIndex: 0,
      fields: [
      { key: "name", label: "Name"},
        { key: "created_at", label: "Date"},
        { key: "photos", label: "Photos" },
        { key: "add", label: "", sortable: false },
      ]
    };
  },
  computed: {
    isNew() {
      return this.unitId === "new";
    },
    deleteImageModalId() {
      return "delete-image-modal";
    }
  },
  mounted() {
    this.fetchData();
    //if this modal opens  
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId === "unit-images-modal") {
        this.fetchData();
      }
    });
  },
  watch: {
    
  },
  methods: {
    onAdd(item){
      this.$emit("newunitimage", item.name);

      
      this.$bvModal.show("upload-image-modal");
      //this.$bvModal.show("upload-unit-image-modal");
      //console.log(item.name);
      

    },
    onDeleteAlbum(item){
     
      this.currentImagesDeleteAlbum= item.photos;
     
      this.$bvModal.show("delete-unit-album-modal");
    },
    onDeleteAlbumConfirm(){
      this.$bvModal.hide("delete-unit-album-modal");
        for(let i=0; i<this.currentImagesDeleteAlbum.length; i++){
          deleteUnitPhoto(this.unitId, this.currentImagesDeleteAlbum[i].id),
        "Image"
        }
        
        this.$emit("deletedunitalbum", this.currentImagesDeleteAlbum);
    
    },
    formatDateNew(value){
      const date = new Date(value);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    },
    deleteByPath(path) {
      this.currentImageId = this.images.find((e) => e.path == path).id;
      if (this.currentImageId) this.onDeleteImageConfirm();
    },
    onDeleteImage(id) {
      this.currentImageId = id;
      this.$bvModal.show(this.deleteImageModalId);
    },
    onDeleteImageConfirm() {
      if (!this.isNew) {
        this.handleDelete(
          deleteUnitPhoto(this.unitId, this.currentImageId),
          "Unit Image"
        ).then(() => {
          this.$bvModal.hide(this.deleteImageModalId);
          this.$bvModal.hide("unit-images-gallery-modal");
          let deletedImage = this.images.find(
            (e) => e.id == this.currentImageId
          );
          this.$emit("deleted", deletedImage);
        });
      } else {
        this.images.splice(
          this.images.findIndex((e) => e == this.currentImageId),
          1
        );
        this.$bvModal.hide(this.deleteImageModalId);
        this.$bvModal.hide("unit-images-gallery-modal");
      }
    },
    onViewImage(index, photos) {
      this.galleryIndex = index;
      this.currentImages = photos;
      this.$bvModal.show("unit-images-gallery-modal");
    },
    fetchData() {
      if (!this.isNew) {
        this.handleFetch(getUnitPhotos(this.unitId)).then((data) => {
          this.items = data;
         
        });
      }
    },
    getImageUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    },
    parseFileType(path) {
      return path.split(".")[1];
    }
  }
};
</script>
<style>
#unit-images-gallery-modal{
  overflow-y: hidden !important;
  padding-left: 0px !important;
height: 100%;
}
#cover-unit-image-modal{
  overflow-y: hidden !important;
  padding-left: 0px !important;
height: 100%;
}
.name {
    width: 180px !important
}
.add{
  width: 70px !important;

  
  text-align: center;
  transition: color 0.3s;
  color: rgba(14, 138, 221, 0.815);
}
.trashBtn{
  color: #e74c3c;
  cursor: pointer;
}
.trashBtn:hover{
  cursor: pointer;
  transition: color 0.3s;
  color: rgb(59, 59, 59);
}
.addBtn{
  margin-right: 9px;
}
.addBtn:hover{
  cursor: pointer;
  transition: color 0.3s;
  color: rgb(59, 59, 59);
}
.created_at{
  width: 130px !important;
  text-align: center;
}
</style>
