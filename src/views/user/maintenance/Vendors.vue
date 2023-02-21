<template>
  <mo-dashboard-body>
    <template #body>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-vendor-modal"
        ref="editVendorModal"
        #body="{props}"
      >
        <edit-vendor :vendor-id="props.vendorId" @end="onEditEnd" />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="delete-vendors-modal"
        :message="deleteMessage"
        @right="onDelete"
      />
      <mo-table
        empty-text="No companies to show"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        @edit="onEdit"
        @select="selected = $event"
      >
        <template #cell(website)="{item}">
          <a v-if="item.website" target="_blank" :href="item.website"
            >{{ formatUrl(item.website) }}
          </a>
          <span v-else>-</span>
        </template>
        <template #cell(phone1)="{item}">
          <a target="_blank" :href="`tel:${item.phone1}`">{{ item.phone1 }}</a>
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
        @click="$refs.editVendorModal.show({ vendorId: 'new' })"
        title="Add new company"
        width="280px"
      />
      <template v-if="selected.length > 0">
        <mo-button
          v-if="$store.getters.hasAdminRole"
          class="mr-2"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-vendors-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { deleteVendor, getVendorsOfCompany } from "@/api/user/vendor";

import EditVendor from "@/views/user/maintenance/EditVendor";

export default {
  name: "Vendors",
  components: { EditVendor },
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
        {
          key: "contact_people",
          label: "Contact person",
          formatter: value =>
            value.length > 0
              ? `${value[0].first_name} ${value[0].last_name}`
              : "-"
        },
        { key: "phone1", label: "Company phone" },
        { key: "email", label: "Email" },
        { key: "website", label: "Website" },
        { key: "options", label: "Edit" }
      ]
    };
  },
  computed: {
    deleteMessage() {
      return `Are you sure you want to delete ${this.selected.length} vendors ?`;
    }
  },
  mounted() {
    this.fetchData();
    if (this.$route.query.new) {
      this.$refs.editVendorModal.show({ vendorId: "new" });
    }
  },
  methods: {
    onEditEnd(preventHide) {
      this.fetchData();
      if (!preventHide) {
        this.$refs.editVendorModal.hide();
        this.$router.push(`/user/profile#maintenance-vendors`);
      }
    },
    onEdit(id) {
      this.$refs.editVendorModal.show({
        vendorId: id
      });
    },
    onDelete() {
      this.$bvModal.hide("delete-vendors-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteVendor(id)),
        "Companies"
      );
    },
    fetchData() {
      this.handleFetch(getVendorsOfCompany(this.$store.getters.companyId)).then(
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
.mo-edit-vendor-modal {
  max-width: 60vw;
}
</style>
