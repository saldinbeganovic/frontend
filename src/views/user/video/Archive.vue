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
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="unarchive-videos-modal"
        :message="modalMessage"
        @right="onUnarchiveConfirm"
      />
      <mo-prompt-modal
        modal-id="delete-archive-modal"
        :message="deleteMessage"
        @right="onDeleteConfirm"
      />

      <mo-video-preview-modal
        modal-id="archived-video-preview-modal"
        :video-path="previewPath"
      />

      <div v-if="cardView" class="d-flex flex-column">
        <h5>Archive</h5>
        <div class="v-100 d-flex">
          <div class="d-inline-flex flex-row flex-wrap">
            <div v-for="video in itemFiltered" :key="video.id">
              <mo-video-preview-card
                :video="video"
                :archived="true"
                @click="onEditVideo(video.id)"
                @unarchive="onUnarchiveVideoButtonClick(video.id)"
                @delete="onDeleteVideoButtonClick(video.id)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="w-100 h-100" v-else>
        <h5>Archive</h5>
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
    <template v-if="selected.length > 0" #footer-left>
      <mo-button
        v-if="$store.getters.hasAdminRole"
        variant="danger"
        title="Delete"
        @click="$bvModal.show('delete-archive-modal')"
      />
    </template>
    <template v-if="selected.length > 0" #footer-right>
      <mo-button
        v-if="$store.getters.hasAdminRole"
        title="Unarchive"
        @click="$bvModal.show('unarchive-videos-modal')"
      />
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  deleteVideo,
  getArchivedVideosOfCompany,
  unarchiveVideo
} from "@/api/user/video/video";
import { formatDate } from "@/utils/utils";
import MoVideoPreviewModal from "@/components/pure/modals/MoVideoPreviewModal";

import MoEditVideo from "@/views/user/video/EditVideo";
import MoVideoPreviewCard from "@/components/statefull/cards/MoVideoPreviewCard";

export default {
  name: "Videos",
  components: { MoVideoPreviewModal, MoEditVideo, MoVideoPreviewCard },
  props: {
    searchQuery: {
      type: String,
      required: true
    },
    cardView: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isLoading: true,
      isSubmitting: false,
      previewPath: null,
      deleteVideoId: null,
      unarchiveVideo: null,
      selected: [],
      items: [],
      itemFiltered: [],
      filterTimeout: null,
      fields: [
        { key: "select", label: "" },
        { key: "thumbnail", label: "", sortable: false },
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
        {
          key: "archived_at",
          label: "Archived",
          formatter: value => formatDate(value)
        }
      ]
    };
  },
  computed: {
    deleteMessage() {
      return this.cardView
        ? `Are you sure you want to delete this video ?`
        : `Are you sure you want to delete ${this.selected.length} videos ?`;
    },
    modalMessage() {
      return this.cardView
        ? `Are you sure you want to move this video back to main folder ?`
        : `Are you sure you want to move ${this.selected.length} videos back to main folder ?`;
    },
    bodyOverflow() {
      return !this.cardView ? "overflow-hidden" : "";
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
    onOpenVideoModal(path) {
      this.previewPath = path;
      this.$bvModal.show("archived-video-preview-modal");
    },
    onDelete() {
      this.$bvModal.hide("delete-archive-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteVideo(id)),
        "Videos"
      ).finally(() => {
        this.$set(this, "selected", {});
      });
    },
    onUnarchive() {
      this.$bvModal.hide("archive-videos-modal");
      this.handleMultipleUnarchive(
        this.selected.map(id => unarchiveVideo(id)),
        "Videos"
      )
        .then(() => {
          this.$emit("refetch-videos");
        })
        .finally(() => {
          this.$set(this, "selected", {});
        });
    },
    fetchData() {
      this.handleFetch(
        getArchivedVideosOfCompany(this.$store.getters.companyId)
      )
        .then(data => {
          this.items = data;
          this.itemFiltered = data;
        })
        .finally(() => {
          if (this.searchQuery) this.filterItems(this.searchQuery);
        });
    },
    onExitEdit() {
      this.$refs.editVideoModal.hide();
      this.fetchData();
    },
    onEditVideo(id) {
      this.$refs.editVideoModal.show({
        videoId: id
      });
    },
    onUnarchiveVideoButtonClick(videoId) {
      this.unarchiveVideo = videoId;
      this.$bvModal.show("unarchive-videos-modal");
    },
    onUnarchiveConfirm() {
      this.cardView ? this.onUnarchiveVideo() : this.onUnarchive();
    },
    onUnarchiveVideo() {
      this.handleUnarchive(unarchiveVideo(this.unarchiveVideo), "Video").then(
        () => {
          this.$emit("refetch-videos");
        }
      );
    },
    onDeleteVideoButtonClick(videoId) {
      this.deleteVideoId = videoId;
      this.$bvModal.show("delete-archive-modal");
    },
    onDeleteConfirm() {
      this.cardView ? this.onDeleteVideo() : this.onDelete();
    },
    onDeleteVideo() {
      this.handleDelete(deleteVideo(this.deleteVideoId), "Video").then(() => {
        this.fetchData();
      });
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
