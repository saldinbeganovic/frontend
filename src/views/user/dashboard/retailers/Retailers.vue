<template>
  <mo-dashboard-body>
    <template #body>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-retailer-modal"
        ref="editRetailerModal"
        #body="{props}"
      >
        <edit-retailer :retailer-id="props.retailerId" @end="onEditEnd" />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="delete-retailers-modal"
        :message="deleteMessage"
        @right="onDelete"
      />
      <mo-table
        empty-text="No retailers to show"
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
    <template #footer-left>
      <mo-button
        v-if="$store.getters.hasAdminRole"
        class="mr-2"
        @click="$refs.editRetailerModal.show({ retailerId: 'new' })"
        title="Add new retailer"
        width="280px"
      />
      <template v-if="selected.length > 0">
        <mo-button
          v-if="$store.getters.hasAdminRole"
          class="mr-2"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-retailers-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { deleteRetailer, getRetailersOfCompany } from "@/api/user/retailer";

import EditRetailer from "@/views/user/dashboard/retailers/Edit";

export default {
  name: "Retailers",
  components: { EditRetailer },
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
      return `Are you sure you want to delete ${this.selected.length} retailers ?`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onEditEnd(preventHide) {
      this.fetchData();
      if (!preventHide) {
        this.$refs.editRetailerModal.hide();
      }
    },
    onEdit(id) {
      this.$refs.editRetailerModal.show({
        retailerId: id
      });
    },
    onDelete() {
      this.$bvModal.hide("delete-retailers-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteRetailer(id)),
        "Retailers"
      );
    },
    fetchData() {
      this.handleFetch(
        getRetailersOfCompany(this.$store.getters.companyId)
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
.mo-edit-retailer-modal {
  max-width: 40vw;
}
</style>
