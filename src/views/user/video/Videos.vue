<template>
  <mo-dashboard-body aligned-class="mo-videos-table__aligned">
    <template #body>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-video-modal"
        ref="editVideoModal"
        #body="{props}"
      >
        <mo-edit-video
          :video-id="props.videoId"
          @exit="onExitEdit"
          @created="onCreated($event)"
        />
        <mo-video-preview-modal
        modal-id="waiting-video-preview-modal"
        :video-path="previewPath"
      />
      </mo-screen-wrapper-modal>

      <mo-screen-wrapper-modal
        dialog-class="mo-create-playlist-modal"
        ref="createPlaylist"
        #body="{props}"
      >
        <mo-create-playlist
          :video-id="props.videoId"
          @exit="onExitEdit"
          @created="onCreated($event)"
        />
        <mo-video-preview-modal
        modal-id="waiting-video-preview-modal"
        :video-path="previewPath"
      />
      </mo-screen-wrapper-modal>
     
      <mo-prompt-modal
        modal-id="delete-videos-modal"
        :message="deleteModelMsg"
        @right="onDelete"
      >
      </mo-prompt-modal>

      <mo-prompt-modal
        modal-id="archive-videos-modal"
        :message="archiveModelMsg"
        @right="onArchiveConfirm"
      >
        <template v-if="cardView" #body> </template>
      </mo-prompt-modal>

      <div v-if="cardView" class="d-flex flex-column">
        <h5>Videos</h5>
        <div class="d-inline-flex flex-row flex-wrap ">
          <div
            class="card-parent"
            v-for="video in itemFiltered"
            :key="video.id"
          >
            <mo-video-preview-card
              :video="video"
              :select-for-wizzard="selectForWizzard"
              @click="onEditVideo(video.id)"
              @archive="onArchiveButtonClick(video.id)"
            />
          </div>
        </div>
      </div>
      <div class="w-100 h-100" v-else>
        <mo-table
          table-class="mo-videos-table mo-table__multiple"
          empty-text="No videos to show."
          :search-query="searchQuery"
          :items="items"
          :fields="fields"
          :loading="isLoading"
          :fixed="true"
          @select="selected = $event"
          :show-edit-button="false"
        >
          <template #cell(title)="{item}">
            <a @click.prevent="onEditVideo(item.id)">
              {{ item.title }}
            </a>
          </template>
          <template #cell(status)="{item}">
            <div
              title="Video is processing."
              v-b-tooltip.hover
              v-if="!!item.is_processing"
            >
              <i class="fa fa-hourglass-half" />
            </div>
            <div title="Processing complete." v-b-tooltip.hover v-else>
              <i class="fa fa-check" />
            </div>
          </template>
          <template #cell(thumbnail)="{item}">
            <img
              style="cursor: pointer"
              @click="onOpenVideoModal(item.path)"
              :src="toS3Url(item.thumbnail)"
            />
          </template>
        </mo-table>
      </div>
    </template>
    <template >
      <mo-button
        v-if="selected.length > 0 && $store.getters.hasAdminRole"
        variant="danger"
        title="Delete"
        @click="$bvModal.show('delete-videos-modal')"
      />
    </template>
    <template #footer-left>
      <mo-button
        v-if="$store.getters.hasAdminRole && !selectForWizzard"
        @click="onAddVideo"
        title="Add video"
        class="mr-2"
      /> 
      <!--
      <mo-button
        v-if="$store.getters.hasAdminRole && !selectForWizzard"
        @click="onAddPlaylist"
        title="Create playlist"
        class="mr-2"
        width="250px"
      /> 
      -->
    </template>
    <template #footer-right>
      <mo-button
        class="ml-2"
        :title="toggleCardViewButtonText"
        width="220px"
        @click="$emit('toggle-card')"
      />
      <mo-button
        class="ml-2"
        icon-name="fa-archive"
        v-if="
          selected.length > 0 &&
            $store.getters.hasAdminRole &&
            !selectForWizzard
        "
        title="Move to archive"
        @click="$bvModal.show('archive-videos-modal')"
      />
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  archiveVideo,
  deleteVideo,
  getVideosOfCompany
} from "@/api/user/video/video";

import MoVideoPreviewModal from "@/components/pure/modals/MoVideoPreviewModal";
import { formatDate } from "@/utils/utils";

import MoEditVideo from "@/views/user/video/EditVideo";
import MoVideoPreviewCard from "@/components/statefull/cards/MoVideoPreviewCard";
import MoCreatePlaylist from "@/views/user/video/createPlaylist";

export default {
  name: "Videos",
  props: {
    searchQuery: {
      type: String,
      required: true
    },
    cardView: {
      type: Boolean,
      default: true
    },
    selectForWizzard: {
      type: Boolean,
      default: false
    }
  },
  components: {
    MoEditVideo,
    MoCreatePlaylist,
    MoVideoPreviewModal,
    MoVideoPreviewCard
    
  },
  data() {
    return {
      isLoading: true,
      isSubmitting: false,
      previewPath: null,
      selected: [],
      items: [],
      itemFiltered: [],
      filterTimeout: null,
      archiveVideoId: "",
      fields: [
        { key: "select", label: "" },
        {
          key: "thumbnail",
          label: "",
          sortable: false,
          formatter: value => value || "-"
        },
        { key: "title", label: "Name" },
        {
          key: "brand.name",
          label: "Brand",
          formatter: value => value || "-"
        },
        {
          key: "created_at",
          label: "Created",
          formatter: value => formatDate(value)
        },
        { key: "status", label: "Status", sortable: false }
      ]
    };
  },
  computed: {
    deleteModelMsg() {
      return this.cardView
        ? `Are you sure you want to delete this video ?`
        : `Are you sure you want to delete ${this.selected.length} videos ?`;
    },
    archiveModelMsg() {
      return this.cardView
        ? `Are you sure you want to move this video to archive folder ?`
        : `Are you sure you want to move ${this.selected.length} videos to archive folder ?`;
    },
    toggleCardViewButtonText() {
      return this.cardView ? "Show table view" : "Toggle table view";
    }
  },
  mounted() {
    this.fetchData();
    this.setVideoFetchInterval();
  },
  methods: {
    //set interval to check for changes every 20 sec
    setVideoFetchInterval() {
      setInterval(
        function() {
          this.fetchData();
        }.bind(this),
        20000
      );
    },
    onDelete() {
      this.$bvModal.hide("delete-videos-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteVideo(id))
      ).finally(() => {
        this.$set(this, "selected", {});
      });
    },
    onArchive() {
      this.$bvModal.hide("archive-videos-modal");
      this.handleMultipleArchive(this.selected.map(id => archiveVideo(id)))
        .then(() => {
          this.$emit("refetch-archive");
        })
        .finally(() => {
          this.$set(this, "selected", {});
        });
    },
    onArchiveButtonClick(videoId) {
      this.archiveVideoId = videoId;
      this.$bvModal.show("archive-videos-modal");
    },
    onArchiveConfirm() {
      this.cardView ? this.onArchiveVideo() : this.onArchive();
    },
    onArchiveVideo() {
      this.handleArchive(archiveVideo(this.archiveVideoId), "Video").then(
        () => {
          this.$emit("refetch-archive");
        }
      );
    },
    fetchData() {
      this.handleFetch(getVideosOfCompany(this.$store.getters.companyId))
        .then(data => {
          this.items = data;
          this.itemFiltered = data;
        })
        .finally(() => {
          if (this.searchQuery) this.filterItems(this.searchQuery);
        });
    },
    onOpenVideoModal(path) {
      this.previewPath = path;
      this.$bvModal.show("waiting-video-preview-modal");
    },
    onExitEdit() {
      this.$refs.editVideoModal.hide();
      this.$refs.createPlaylist.hide();
      this.fetchData();
    },
    onCreated(id) {
      this.onExitEdit();
      this.onEditVideo(id);
    },
    onEditVideo(id) {
      if (!this.selectForWizzard) {
        this.$refs.editVideoModal.show({
          videoId: id
        });
      } else {
        this.$emit("selected-video", id);
      }
    },
    onAddVideo() {
      this.$refs.editVideoModal.show({
        videoId: "new"
      });
    },
    onAddPlaylist() {
      this.$refs.createPlaylist.show({ videoId: "new"});
    },
    filterItems(filter) {
      if (this.filterTimeout) clearTimeout(this.filterTimeout);
      if (filter) {
        this.itemFiltered = this.items.filter(o =>
          Object.keys(o).some(k => {
            return o[k]
              ? o[k]
                  .toString()
                  .toLowerCase()
                  .includes(filter.toString().toLowerCase())
              : false;
          })
        );
      } else {
        this.itemFiltered = this.items;
      }
    }
  },
  watch: {
    searchQuery(value) {
      // filter items
      if (this.filterTimeout) clearTimeout(this.filterTimeout);
      this.filterTimeout = setTimeout(this.filterItems, 1000, value);
    }
  }
};
</script>
<style lang="scss">
.mo-videos-table {
  overflow-x: hidden;

  min-width: 1260px;
  &__aligned {
    height: auto !important;
    margin: auto;
  }
  .thumbnail {
    width: 70px;
  }
  .title {
    width: 380px;
  }
  .brand-name {
    width: 330px;
  }
  .select {
    width: 50px;
  }
  .created_at {
    width: 15%;
  }

  //archived_at
  .status {
    text-align: center;
  }
}
.mo-create-playlist-modal {
  width: 740px;
  min-width: 740px;
}
.mo-edit-video-modal {
  width: 740px;
  min-width: 740px;
}
</style>
