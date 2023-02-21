<template>
  <mo-dashboard-body>
    <template #body>
      <mo-table
        empty-text="No batches to show"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        @select="selected = $event"
        :show-select-all="false"
        @edit="onEdit"
      >
        <template #cell(is_activated)="{item}">
          <mo-status-badge
            :title="item.is_activated ? 'Activated' : 'Draft'"
            :variant="item.is_activated ? 'success' : 'info'"
            :clickable="false"
          />
        </template>
      </mo-table>
    </template>
    <template #footer-left>
      <mo-button @click="onAddBatch" title="Add batch" />
    </template>
  </mo-dashboard-body>
</template>

<script>
import { getManufacturerBatches } from "@/api/manufacturer";
import { formatDate } from "@/utils/utils";

export default {
  name: "Batches",
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      selected: [],
      items: [],
      fields: [
        { key: "name", label: "Name" },
        { key: "notes", label: "Note" },
        {
          key: "activation_code",
          label: "Activation code",
          formatter: value => value || "-"
        },
        {
          key: "created_at",
          label: "Created",
          formatter: value => formatDate(value, true, false, true)
        },
        { key: "is_activated", label: "Status" },
        { key: "options", label: "" }
      ]
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.handleFetch(getManufacturerBatches()).then(data => {
        this.items = data;
      });
    },
    onEdit(batchId) {
      this.$router.push(`/manufacturer/batch/${batchId}`);
    },
    onAddBatch() {
      this.$router.push("/manufacturer/batch/new");
    }
  }
};
</script>
