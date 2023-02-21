<template>
  <dashboard title="Manufacturers" @search="searchQuery = $event">
    <template #body>
      <mo-prompt-modal
        modal-id="delete-manufacturers-modal"
        message="Are you sure you want to delete selected manufacturers ?"
        @right="onDelete"
      />
      <mo-prompt-modal
        modal-id="block-manufacturers-modal"
        message="Are you sure you want to block selected manufacturers ?"
        @right="onBlock"
      />
      <mo-prompt-modal
        modal-id="unblock-manufacturers-modal"
        message="Are you sure you want to unblock selected manufacturers ?"
        @right="onUnblock"
      />
      <mo-dashboard-body>
        <template #body>
          <mo-table
            empty-text="No manufacturers to show"
            :fields="fields"
            :items="items"
            :loading="isLoading"
            :search-query="searchQuery"
            @select="selected = $event"
          >
            <template #cell(is_blocked)="{item}">
              <mo-status-badge
                :title="item.is_blocked ? 'Blocked' : 'Active'"
                :variant="item.is_blocked ? 'danger' : 'success'"
                :clickable="false"
              />
            </template>
          </mo-table>
        </template>
        <template v-if="selected.length > 0" #footer-left>
          <mo-button
            class="mr-2"
            title="Delete"
            variant="danger"
            @click="$bvModal.show('delete-manufacturers-modal')"
          />
          <mo-button
            class="mr-2"
            title="Block"
            @click="$bvModal.show('block-manufacturers-modal')"
          />
          <mo-button
            class="mr-2"
            title="Unblock"
            @click="$bvModal.show('unblock-manufacturers-modal')"
          />
        </template>
      </mo-dashboard-body>
    </template>
  </dashboard>
</template>
<script>
import Dashboard from "@/layouts/MoDashboard";
import { getManufacturers } from "@/api/manufacturer";
import { formatDate } from "@/utils/utils";
import {
  blockManufacturer,
  unblockManufacturer,
  deleteManufacturer
} from "@/api/manufacturer";

export default {
  name: "Companies",
  components: {
    Dashboard
  },
  data() {
    return {
      isLoading: true,
      items: [],
      selected: [],
      searchQuery: "",
      fields: [
        { key: "select" },
        { key: "id", label: "ID", formatter: value => `#${value}` },
        { key: "name", label: "Company name" },
        { key: "user.email", label: "Email" },
        { key: "is_blocked", label: "Status" },
        {
          key: "created_at",
          label: "Created at",
          formatter: value => formatDate(value)
        }
      ]
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.handleFetch(getManufacturers()).then(res => {
        this.items = res;
      });
    },
    onBlock() {
      this.handleMultipleBlock(
        this.selected.map(id => blockManufacturer(id))
      ).then(() => this.fetchData());
    },
    onUnblock() {
      this.handleMultipleUnblock(
        this.selected.map(id => unblockManufacturer(id))
      ).then(() => this.fetchData());
    },
    onDelete() {
      this.handleMultipleDelete(
        this.selected.map(id => deleteManufacturer(id))
      );
    }
  }
};
</script>
