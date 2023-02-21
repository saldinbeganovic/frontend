<template>
  <mo-dashboard-body>
    <template #body>
      <mo-image-gallery
        modal-id="graphic-and-files-preview-modal"
        :images="currentCampaignPhoto"
      />
      <mo-prompt-modal
        modal-id="delete-points-of-sale-modal"
        :message="
          `Are you sure you want to delete ${selected.length} decorating houses ?`
        "
      />
      <mo-table
        :items="items"
        :fields="fields"
        :loading="isLoading"
        @select="selected = $event"
        @edit="onEdit"
      >
        <template #cell(preview)="{item}">
          <img
            style="cursor: pointer"
            v-if="isImage(item.path)"
            :src="toS3Url(item.path)"
            alt="Campaign cover photo"
            @click="onShowPreview(item.path)"
          />
          <i v-else class="fas fa-ban" />
        </template>
      </mo-table>
      <mo-screen-wrapper-modal ref="viewEditGraphicsModal" #body="{props}">
        <mo-edit-graphic-modal :graphic-id="props.graphicId" />
      </mo-screen-wrapper-modal>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { getVisualCampaign } from "@/api/user/campaigns/campaigns";
import { formatDate } from "@/utils/utils";
import MoEditGraphicModal from "@/views/user/visuals/graphic/Edit";
import MoImageGallery from "../../../../../components/pure/modals/MoImageGallery";

export default {
  name: "Graphics",
  components: { MoImageGallery, MoEditGraphicModal },
  data() {
    return {
      isLoading: true,
      currentUser: null,
      selected: [],
      currentCampaignPhoto: [],
      items: [],
      fields: [
        { key: "title", label: "File name" },
        {
          key: "size",
          label: "File size",
          formatter: this.formatBytes
        },
        { key: "preview", label: "Preview" },
        {
          key: "path",
          label: "File type",
          formatter: value => this.fileType(value)
        },
        { key: "created_at", label: "Uploaded date", formatter: formatDate },
        { key: "options", label: "" }
      ]
    };
  },
  props: {
    campaignId: {
      required: true
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    getVideoUrl(path) {
      return `${process.env.VUE_APP_S3_HOST}/${path}`;
    },
    onEdit(id) {
      this.$refs.viewEditGraphicsModal.show({
        graphicId: id
      });
    },
    fetchData() {
      this.handleFetch(getVisualCampaign(this.campaignId)).then(data => {
        this.items = data.attachments;
      });
    },
    onShowPreview(path) {
      this.currentCampaignPhoto = [{ path }];
      this.$bvModal.show("graphic-and-files-preview-modal");
    }
  }
};
</script>
