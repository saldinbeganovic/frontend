<template>
  <b-card
    :img-src="toS3Url(video.thumbnail)"
    img-alt="Image"
    img-top
    @click="onCardClick"
  >
    <template #header>
      <b> {{ video.title }}</b>
    </template>

    <b-card-text>
      <div class="float-right">
        <b-badge pill variant="dark">
          {{ formatBytes(video.size) }}
        </b-badge>
      </div>
      <span  v-if="video.brand"> <b> Brand:</b> {{ video.brand.name }}</span>

      <span  v-else><b> Brand:</b> / </span>
      
      <div style="position: absolute;
    bottom: 59px;
    right: 30px;
    color: gray;">
        <span style="font-size: 16px;">{{ formatDateNew(video.created_at) }}</span>
      </div>
      
    </b-card-text>
    <template
      v-if="!archived && $store.getters.hasAdminRole && !selectForWizzard"
      #footer
    >
      <div class="footer-card" @click.stop="onArchiveClick">
        <i class="fas fa-archive mr-2"></i><span class="m-1">Archive</span>
      </div>
    </template>
    <template
      v-else-if="$store.getters.hasAdminRole && !selectForWizzard"
      #footer
    >
      <b-col>
        <b-row>
          <b-col cols="6" class="footer-archive" @click.stop="onArchiveClick">
            <i class="fas fa-recycle mr-2"></i
            ><span class="m-1">Make active</span></b-col
          >
          <b-col cols="6" class="footer-delete " @click.stop="onDelete">
            <i class="fas fa-trash mr-2"></i>
            <span class="m-1">Delete</span>
          </b-col>
        </b-row>
      </b-col>
    </template>
  </b-card>
</template>

<script>
//NOTE: if this design will be used on other components, move styling to scss file and make pure component

export default {
  props: {
    video: {
      type: Object,
      required: true
    },
    archived: {
      type: Boolean,
      default: false
    },
    selectForWizzard: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onCardClick() {
      this.$emit("click");
    },
    onArchiveClick() {
      this.archived ? this.$emit("unarchive") : this.$emit("archive");
    },
    onDelete() {
      this.$emit("delete");
    },
    formatDateNew(value){
      const date = new Date(value);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.card {
  margin: 1.5rem 1vw;
  box-shadow: 0px 4px 8px 0px black;
  transition: 0.3s;

  &:hover {
    box-shadow: 0px 8px 16px 0 black;
  }
  border-radius: 10px;
  border: none;
  cursor: pointer;
  width: 16vw;
  height: 22.5rem;
  @media (max-width: 1500px) {
    width: 20vw;
  }
  @media (max-width: 1300px) {
    width: 26vw;
  }
  img {
    object-fit: contain;
    background: black;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    height: 11rem;
  }
  .card-header {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: black;
    color: white;
  }
  .card-footer {
    background: unset;
    text-align: center;
    padding: unset;
  }
  .footer-card {
    padding: 0.75rem 1.25rem;
    &:hover {
      background: black;
      color: white;
      border-bottom-right-radius: 10px;
      border-bottom-left-radius: 10px;
    }
  }
  .footer-archive {
    padding: 0.75rem 0;
    &:hover {
      background: black;
      color: white;

      border-bottom-left-radius: 10px;
    }
  }
  .footer-delete {
    padding: 0.75rem 0;
    &:hover {
      background: red;
      color: black;
      border-bottom-right-radius: 10px;
    }
  }
}
</style>
