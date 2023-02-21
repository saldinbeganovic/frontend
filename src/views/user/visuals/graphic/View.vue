<template>
  <mo-dashboard-body
    aligned-class="mo-graphics-table__aligned"
    body-class="pb-3"
  >
    <template #body>
      <mo-image-gallery
        :modal-id="graphicPreviewModalModalId"
        :images="currentPhoto"
      />
      <mo-prompt-modal
        :modal-id="deleteGraphicModalModalId"
        :message="
          `Are you sure you want to delete ${selected.length} graphics ?`
        "
        @right="onDelete"
      />

      <h5 v-if="!isArchive">Graphics and Files</h5>
      <h5 v-else>Archived Graphics and Files</h5>

      <mo-table
        empty-text="No graphics to show"
        table-class="mo-graphics-table mo-table__multiple"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        :fixed="true"
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
    </template>
    <template #footer-left>
      <mo-button
        class="mr-2"
        v-if="$store.getters.hasAdminRole && !isArchive"
        @click="onEdit('new')"
        title="Add graphic"
      />
      <template>
        <mo-button
          v-if="$store.getters.hasAdminRole && !isArchive"
          :title="archiveTextButton"
          width="420px"
          variant="danger"
          :disabled="disabledArchiveButton"
          @click="$bvModal.show(deleteGraphicModalModalId)"
        />
        <mo-button
          v-if="showDeleteButton"
          title="Delete"
          variant="danger"
          @click="$bvModal.show(deleteGraphicModalModalId)"
        />
      </template>

      <mo-screen-wrapper-modal
        dialog-class="mo-edit-graphic-modal"
        ref="viewEditGraphicsModal"
        #body="{props}"
      >
        <mo-edit-graphic-modal
          :graphic-id="props.graphicId"
          @upload-finished="fetchData()"
        />
      </mo-screen-wrapper-modal>
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  deleteGraphic,
  getGraphicsOfCompany,
  updateGraphic
} from "@/api/user/campaigns/graphics";
import { formatDate } from "@/utils/utils";

import MoEditGraphicModal from "@/views/user/visuals/graphic/Edit";
import MoImageGallery from "../../../../components/pure/modals/MoImageGallery";

export default {
  name: "Graphics",
  components: { MoImageGallery, MoEditGraphicModal },
  props: {
    searchQuery: {
      type: String,
      required: true
    },
    isArchive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: true,
      currentUser: null,
      currentPhoto: [],
      selected: [],
      items: [],
      fields: [
        { key: "select", label: "" },
        { key: "preview", label: "Preview", sortable: false },
        { key: "title", label: "File name" },
        {
          key: "size",
          label: "File size",
          formatter: this.formatBytes
        },
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
  computed: {
    prefix() {
      return this.isArchive ? "archive_" : "";
    },
    graphicPreviewModalModalId() {
      return `${this.prefix}graphic-preview-modal`;
    },
    deleteGraphicModalModalId() {
      return `${this.prefix}mo-delete-graphics-modal`;
    },
    getGraphicsRequestData() {
      return {
        is_archived: this.isArchive ? 1 : 0
      };
    },
    disabledArchiveButton() {
      return !(this.selected.length > 0);
    },
    showDeleteButton() {
      return (
        this.selected.length > 0 &&
        this.isArchive &&
        this.$store.getters.hasAdminRole
      );
    },
    archiveTextButton() {
      return `Move selected file${
        this.selected.length > 1 ? "s" : ""
      } to the archive`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onEdit(id) {
      this.$refs.viewEditGraphicsModal.show({
        graphicId: id
      });
    },
    onDelete() {
      this.$bvModal.hide(this.deleteGraphicModalModalId);

      if (this.isArchive) {
        this.handleMultipleDelete(
          this.selected.map(id => deleteGraphic(id)),
          "Graphics"
        );
      } else {
        var tempArray = [];
        this.selected.map(id =>
          tempArray.push(this.items.find(e => e.id == id))
        );
        this.handleMultipleArchive(
          tempArray.map(function(data) {
            data.is_archived = 1;
            updateGraphic(data.id, data);
          }),
          "Graphics"
        )
          .then(() => {
            this.$emit("refetch-archive");
          })
          .finally(() => {
            this.fetchData();
          });
      }
    },
    fetchData() {
      this.handleFetch(
        getGraphicsOfCompany(
          this.$store.getters.companyId,
          this.getGraphicsRequestData
        )
      )
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
    onShowPreview(path) {
      this.currentPhoto = [{ path }];
      this.$bvModal.show(this.graphicPreviewModalModalId);
    }
  }
};
</script>
<style lang="scss">
.mo-edit-graphic-modal {
  max-width: 60vw;
}
.mo-graphics-table {
  overflow-x: hidden;
  min-width: 1175px;
  &__aligned {
    max-height: 800px !important;
    height: auto !important;
  }

  .preview {
    width: 90px;
  }
  .select {
    width: 50px;
  }
  .title {
    width: 42%;
  }
  .size,
  .path {
    width: 10%;
  }
  .created_at {
    width: 15%;
  }
  .options {
    text-overflow: unset;
  }
}
</style>
