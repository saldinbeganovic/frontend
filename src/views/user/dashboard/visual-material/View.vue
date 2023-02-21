<template>
  <mo-dashboard-body
    aligned-class="mo-visual-material-table__aligned"
    body-class="pb-3"
  >
    <template #body>
      <mo-prompt-modal
        modal-id="delete-visual-material-modal"
        :message="deleteMessage"
        @right="onDelete"
      />
      <mo-screen-wrapper-modal
        ref="editVisualMaterial"
        dialog-class="mo-edit-visual-material-modal__dialog"
        #body="{props}"
      >
        <mo-edit-visual-material-modal
          :visual-material-id="props.visualMaterialId"
          @fetch="fetchData()"
          @delete="onVisualMaterialModalDelete"
        />
      </mo-screen-wrapper-modal>

      <h5>Visual materials</h5>

      <mo-table
        empty-text="No visual materials to show"
        table-class="mo-visual-material-table"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        @select="selected = $event"
        @edit="onEdit"
      >
      </mo-table>
    </template>
    <template #footer-left v-if="$store.getters.hasAdminRole">
      <mo-button
        class="mr-2"
        title="Add new visual material"
        width="325px"
        @click="onAdd"
      />
      <template v-if="selected.length > 0">
        <mo-button
          class="mr-2"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-visual-material-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { getVisualMaterials } from "@/api/admin/company/company";
import { deleteVisualMaterial } from "@/api/user/campaigns/visual-materials";

import MoEditVisualMaterialModal from "@/views/user/dashboard/visual-material/Edit";

export default {
  name: "VisualMaterial",
  components: {
    MoEditVisualMaterialModal
  },
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      currentUser: null,
      currentPhoto: [],
      selected: [],
      items: [],
      deleteId: null,
      fields: [
        { key: "select", label: "" },
        {
          key: "name",
          label: "Name"
        },
        {
          key: "notes",
          label: "Notes"
        },
        {
          key: "options",
          label: "Edit"
        }
      ]
    };
  },
  computed: {
    deleteMessage() {
      return `Are you sure you want to delete ${this.selected.length} visual materias ?`;
    }
  },
  created() {
    this.fetchData();
  },
  mounted() {},
  methods: {
    fetchData() {
      this.handleFetch(getVisualMaterials(this.$store.getters.companyId))
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
    onAdd() {
      this.$refs.editVisualMaterial.show({
        visualMaterialId: "new"
      });
    },
    onEdit(id) {
      this.$refs.editVisualMaterial.show({
        visualMaterialId: id
      });
    },
    showDeleteVisualMaterialConformationModal(id) {
      this.deleteId = id;
      this.$bvModal.show(this.deleteVisualMaterialModalId);
    },
    onDelete() {
      this.$bvModal.hide("delete-visual-material-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteVisualMaterial(id)),
        "Printing order"
      );
    },
    onVisualMaterialModalDelete() {
      this.$refs.editVisualMaterial.hide();
      this.fetchData();
    },
    onDeleteVisualMaterial() {
      this.handleDelete(
        deleteVisualMaterial(this.deleteId),
        "Printing order"
      ).then(() => {
        this.fetchData();
      });
    }
  }
};
</script>
<style lang="scss">
.mo-visual-material-table {
  max-height: 800px !important;
  height: unset !important;
  .id,
  .preview {
    width: 70px;
  }
  .status {
    width: 180px;
    max-width: 180px;
  }
  .visual_campaign_title {
    width: 240px;
    max-width: 240px;
  }
  .shipping_type,
  .addresses,
  .deadline,
  .created_at {
    width: 250px;
  }
}
</style>
