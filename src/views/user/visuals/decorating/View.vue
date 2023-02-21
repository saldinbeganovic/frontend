<template>
  <mo-dashboard-body>
    <template #body>
      <mo-screen-wrapper-modal ref="editDecoratingHouseModal" #body="{props}">
        <edit-decorating-house
          :decorating-house-id="props.decoratingHouseId"
          @end="onEditEnd"
        />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="delete-decorating-houses-modal"
        :message="
          `Are you sure you want to delete ${selected.length} decorating houses ?`
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
        @click="
          $refs.editDecoratingHouseModal.show({ decoratingHouseId: 'new' })
        "
        width="300px"
        title="Add decorating house"
      />
      <template v-if="selected.length > 0">
        <mo-button
          v-if="$store.getters.hasAdminRole"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-decorating-houses-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  deleteDecoratingHouse,
  getDecoratingHousesOfCompany
} from "@/api/user/campaigns/decorating-houses";

import EditDecoratingHouse from "@/views/user/visuals/decorating/Edit";

export default {
  name: "DecoratingHouses",
  components: { EditDecoratingHouse },
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
        { key: "name", label: "Group" },
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
        this.$refs.editDecoratingHouseModal.hide();
      }
    },
    onEdit(id) {
      this.$refs.editDecoratingHouseModal.show({
        decoratingHouseId: id
      });
    },
    onDelete() {
      this.$bvModal.hide("delete-decorating-houses-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteDecoratingHouse(id)),
        "Decorating Houses"
      );
    },
    fetchData() {
      this.handleFetch(
        getDecoratingHousesOfCompany(this.$store.getters.companyId)
      ).then(data => {
        this.items = data;
      });
    }
  }
};
</script>
