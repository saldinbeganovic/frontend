<template>
  <mo-dashboard-body>
    <template #body>
      <mo-screen-wrapper-modal ref="editPrintingHouseModal" #body="{props}">
        <edit-printing-house
          :printing-house-id="props.printingHouseId"
          @end="onEditEnd"
        />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="delete-printing-houses-modal"
        :message="
          `Are you sure you want to delete ${selected.length} printing houses ?`
        "
        @right="onDelete"
      />
      <mo-table
        empty-text="No decorating houses to show"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        @select="selected = $event"
        @edit="onEdit"
      >
      </mo-table>
    </template>
    <template #footer-left>
      <mo-button
        v-if="$store.getters.hasAdminRole"
        class="mr-2"
        @click="$refs.editPrintingHouseModal.show({ printingHouseId: 'new' })"
        width="300px"
        title="Add printing house"
      />
      <template v-if="selected.length > 0">
        <mo-button
          v-if="$store.getters.hasAdminRole"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-printing-houses-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  deletePrintingHouse,
  getPrintingHousesOfCompany
} from "@/api/user/campaigns/printing-houses";

import EditPrintingHouse from "@/views/user/visuals/printing/Edit";

export default {
  name: "Pos",
  components: { EditPrintingHouse },
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
      selected: [],
      items: [],
      fields: [
        { key: "select", label: "" },
        { key: "name", label: "Company" },
        { key: "contact_person", label: "Contact" },
        { key: "phone", label: "Phone number" },
        { key: "email", label: "Email" },
        { key: "website", label: "Website" },
        { key: "options", label: "" }
      ]
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onEditEnd(preventHide) {
      this.fetchData();
      if (!preventHide) {
        this.$refs.editPrintingHouseModal.hide();
      }
    },
    onEdit(id) {
      this.$refs.editPrintingHouseModal.show({
        printingHouseId: id
      });
    },
    onDelete() {
      this.$bvModal.hide("delete-printing-houses-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deletePrintingHouse(id)),
        "Printing Houses"
      );
    },
    fetchData() {
      this.handleFetch(
        getPrintingHousesOfCompany(this.$store.getters.companyId)
      ).then(data => {
        this.items = data;
      });
    }
  }
};
</script>
