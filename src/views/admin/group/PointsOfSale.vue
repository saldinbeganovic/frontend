<template>
  <mo-dashboard-body>
    <template #body>
      <mo-prompt-modal
        modal-id="delete-points-of-sale-modal"
        :message="
          `Are you sure you want to delete ${selected.length} points of sale ?`
        "
        @right="onDelete"
      />
      <mo-table
        empty-text="No points of sale to show"
        :items="items"
        :fields="fields"
        :search-query="searchQuery"
        :loading="isLoading"
        @select="selected = $event"
        @edit="onEdit"
      >
        <template #cell(logo)="{item}">
          <img v-if="item.image" :src="getImageUrl(item.logo)" />
          <i v-else class="fa fa-store mo-company-icon" />
        </template>
        <template #cell(manager)="{item}">
          {{ item.manager_first_name || "-" }}
          {{ item.manager_last_name }}
        </template>
        <template #cell(status)="{item}">
          <mo-status-badge
            :title="
              statusTitle(item.active_modems, item.inactive_modems, 'No modems')
            "
            :variant="statusVariant(item.active_modems, item.inactive_modems)"
          />
        </template>
      </mo-table>
    </template>
    <template #footer-left>
      <mo-button
        class="mr-2"
        @click="$router.push(`/admin/company/${companyId}/pos/new`)"
        title="Add PoS"
      />
      <mo-button
        v-if="selected.length > 0"
        title="Delete"
        variant="danger"
        @click="$bvModal.show('delete-points-of-sale-modal')"
      />
    </template>
  </mo-dashboard-body>
</template>

<script>
import { deletePos } from "@/api/admin/company/point-of-sale";

export default {
  name: "Pos",
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
        { key: "select", label: "" },
        { key: "logo", label: "Image" },
        { key: "name", label: "Name" },
        { key: "country.name", label: "Country" },
        { key: "city", label: "City" },
        { key: "manager", label: "Manager" },
        { key: "status", label: "Modem status", sortable: false },
        { key: "options", label: "" }
      ]
    };
  },
  computed: {
    companyId() {
      return this.$route.params.companyId;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onEdit(posId) {
      this.$router.push(`/admin/company/${this.companyId}/pos/${posId}`);
    },
    onDelete() {
      this.$bvModal.hide("delete-points-of-sale-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deletePos(id)),
        "Points of Sale"
      );
    },
    fetchData() {
      this.handleFetch(this.getPos()).then(data => {
        this.items = data;
      });
    },
    getImageUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    }
  }
};
</script>
