<template>
  <div class="w-100">
    <mo-prompt-modal
      modal-id="delete-pos-images-modal"
      message="Are you sure you want to delete this image ? 
      (if the image is a cover photo the cover photo will also be removed)"
      @right="onDeleteConfirm"
    />
    <mo-prompt-modal
      modal-id="delete-pos-album-modal"
      message="Are you sure you want to delete this album? 
      (this action will also delete all the images in the album)"
      @right="onDeleteAlbumConfirm"
    />
    <mo-image-gallery
      modal-id="pos-unit-images-gallery-modal"
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
          @click="onDelete(item)"
        />
      </template>
    </mo-image-gallery>
    <mo-table
      empty-text="No images to show"
      table-class="mo-pos-images-table"
      :fields="fields"
      :items="items"
      :loading="isLoading"
      :show-edit-button="false"
      :show-id-field="false"
      @select="selected = $event"
    >
      <template #cell(photos)="{item}">
        <img
          
          v-for="(photo, index) of item.photos.filter((e) =>{return e.path!=null}).slice(0, maxPhotos)"
          class="mr-2"
          style="cursor: pointer"
          :key="index"
          :alt="photo.title"
          :src="getImageUrl(photo.path)"
          @click="onViewImage(index, item.photos)"
        />
        <span v-if="item.photos.length > maxPhotos"
          >+ {{ item.photos.length - maxPhotos }}</span
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
//import { formatDate } from "@/utils/utils";
import MoImageGallery from "@/components/pure/modals/MoImageGallery";
import { deletePosPhoto, getPosPhotos } from "@/api/admin/company/photos";

export default {
  name: "MoPosImages",
  components: { MoImageGallery },
  props: {
    images: {
      type: Array,
    },
  },
  data() {
    return {
      maxPhotos: 6,
      tempCover: null,
      currentDeleteImage: null,
      currentImagesDeleteAlbum: null,
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
      ],
    };
  },
  computed: {
    posId() {
      return this.$route.params.posId;
    },
    isNew() {
      return this.posId === "new";
    },
  },
  mounted() {
    this.fetchData();
    
  },
  methods: {
    onAdd(item){
      this.$emit("newimage", item.name);

      this.$bvModal.show("upload-pos-image-modal");
      //console.log(item.name);
      

    },
    onDeleteAlbum(item){
      
      this.currentImagesDeleteAlbum= item.photos;
      
      this.$bvModal.show("delete-pos-album-modal");
    },
    formatDateNew(value){
      const date = new Date(value);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    },
    deleteByPath(path) {
      this.currentDeleteImage = this.images.find((e) => e.path == path);
      if (this.currentDeleteImage) this.onDeleteConfirm();
    },
    onDelete(image) {
      this.currentDeleteImage = image;
      this.$bvModal.show("delete-pos-images-modal");
    },
    onDeleteAlbumConfirm(){
      this.$bvModal.hide("delete-pos-album-modal");
        for(let i=0; i<this.currentImagesDeleteAlbum.length; i++){
          deletePosPhoto(this.posId, this.currentImagesDeleteAlbum[i].id),
        "Image"
        }
        
        this.$emit("deletedalbum", this.currentImagesDeleteAlbum);
    
    },
    onDeleteConfirm() {
      this.$bvModal.hide("delete-pos-images-modal");
      this.handleDelete(
        deletePosPhoto(this.posId, this.currentDeleteImage.id),
        "Image"
      ).then(() => {
        this.$bvModal.hide("pos-unit-images-gallery-modal");
        this.$emit("deleted", this.currentDeleteImage);
      });
    },
    onViewImage(index, photos) {
      this.galleryIndex = index;
      this.currentImages = photos;
      this.$bvModal.show("pos-unit-images-gallery-modal");
    },
    fetchData() {
      if (!this.isNew) {
        this.handleFetch(getPosPhotos(this.posId)).then((data) => {
          this.items = data;
      
        });
        
      }
      
    },
    getImageUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    },
    parseFileType(path) {
      return path.split(".")[1];
    },
  },
};
</script>
<style lang="scss">
.mo-pos-images-table {
  .created_at {
    max-width: 150px;
  }
}
#pos-unit-images-gallery-modal{
  height: 100%;
  overflow-y: hidden !important;
  padding-left: 0px !important;
}
#cover-unit-image-modal{
  height: 100%;
  overflow-y: hidden !important;
  padding-left: 0px !important;
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
