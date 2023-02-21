<template>
  <mo-dashboard-body>
    <template #body>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-warehouse-modal"
        ref="editWarehouseModal"
        #body="{props}"
      >
        <edit-warehouse :warehouse-id="props.warehouseId" @end="onEditEnd" />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="delete-warehouses-modal"
        :message="deleteMessage"
        @right="onDelete"
      />
      <mo-table
        empty-text="No warehouses to show"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        @edit="onEdit"
        @select="selected = $event"
      >
        <template #cell(phone)="{item}">
          <a target="_blank" :href="`tel:${item.phone}`">{{ item.phone }}</a>
        </template>
        <template #cell(email)="{item}">
          <a target="_blank" :href="`mailto:${item.email}`">{{ item.email }}</a>
        </template>
      </mo-table>
    </template>
    <template #footer-left v-if="$store.getters.hasAdminRole">
      <mo-button
        class="mr-2"
        @click="$refs.editWarehouseModal.show({ warehouseId: 'new' })"
        title="Add new warehouse"
        width="280px"
      />
      <template v-if="selected.length > 0">
        <mo-button
          class="mr-2"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-warehouses-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { deleteWarehouse, getWarehousesOfCompany } from "@/api/user/warehouse";

import EditWarehouse from "@/views/user/dashboard/warehouse/Edit";

export default {
  name: "Warehouses",
  components: { EditWarehouse },
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      items: [],
      selected: [],
      fields: [
        { key: "select", label: "" },
        { key: "name", label: "Name" },
        { key: "options", label: "Edit" }
      ]
    };
  },
  computed: {
    deleteMessage() {
      return `Are you sure you want to delete ${this.selected.length} warehouses ?`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onEditEnd(preventHide) {
      this.fetchData();
      if (!preventHide) {
        this.$refs.editWarehouseModal.hide();
      }
    },
    onEdit(id) {
      this.$refs.editWarehouseModal.show({
        warehouseId: id
      });
    },
    onDelete() {
      this.$bvModal.hide("delete-warehouses-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteWarehouse(id)),
        "Retailers"
      );
    },
    fetchData() {
      this.handleFetch(
        getWarehousesOfCompany(this.$store.getters.companyId)
      ).then(data => {
        this.items = data;
      });
    },
    formatUrl(url) {
      return url ? url.substring(url.indexOf("//") + 2, url.length) : "-";
    }
  }
};
</script>
<style lang="scss">
.mo-edit-warehouse-modal {
  max-width: 40vw;
}
</style>
