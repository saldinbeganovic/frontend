<template>
  <mo-dashboard-body>
    <template #body>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-brand-modal"
        ref="editBrandModal"
        #body="{props}"
      >
        <edit-brand :brand-id="props.brandId" @end="onEditEnd" />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="delete-brands-modal"
        :message="deleteMessage"
        @right="onDelete"
      />
      <mo-table
        empty-text="No brands to show"
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
        class="mr-2"
        v-if="$store.getters.hasAdminRole"
        @click="$refs.editBrandModal.show({ brandId: 'new' })"
        title="Add new brand"
        width="280px"
      />
      <template v-if="selected.length > 0">
        <mo-button
          v-if="$store.getters.hasAdminRole"
          class="mr-2"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-brands-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { deleteBrand, getBrandsOfCompany } from "@/api/user/brand";
import EditBrand from "@/views/user/dashboard/brands/Edit";

export default {
  name: "Retailers",
  components: { EditBrand },
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
      return `Are you sure you want to delete ${this.selected.length} brands ?`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onEditEnd(preventHide) {
      this.fetchData();
      if (!preventHide) {
        this.$refs.editBrandModal.hide();
      }
    },
    onEdit(id) {
      this.$refs.editBrandModal.show({
        brandId: id
      });
    },
    onDelete() {
      this.$bvModal.hide("delete-brands-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteBrand(id)),
        "Retailers"
      );
    },
    fetchData() {
      this.handleFetch(getBrandsOfCompany(this.$store.getters.companyId)).then(
        data => {
          this.items = data;
        }
      );
    },
    formatUrl(url) {
      return url ? url.substring(url.indexOf("//") + 2, url.length) : "-";
    }
  }
};
</script>
<style lang="scss">
.mo-edit-brand-modal {
  max-width: 40vw;
}
</style>
