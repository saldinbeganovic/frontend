<template>
  <mo-dashboard-body>
    <template #body>
      <mo-prompt-modal
        modal-id="delete-modems-modal"
        :message="deleteMessage"
        @right="onDelete"
      />
      <mo-table
        class="mo-modems-table"
        empty-text="No modems to show"
        :fields="fields"
        :items="items"
        :search-query="searchQuery"
        :loading="isLoading"
        @edit="onEdit"
        @select="selected = $event"
      >
        <template #cell(status)="{item}">
          <mo-status-badge
            :title="item.state ? 'Online' : 'Offline'"
            :variant="item.state ? 'success' : 'danger'"
            :clickable="false"
          />
        </template>
        <template #cell(config)="{item}">
          <b-button
            class="mo-table__edit"
            @click="onDownloadConfig(item.id, item.hostname)"
          >
            <i class="fa fa-download mo-text__primary" />
          </b-button>
        </template>
        <template #cell(created_at)="{item}">
          {{ formatDate(item.created_at, true) }}
        </template>
        <template #cell(activated)="{item}">
          <i v-if="item.point_of_sale" class="fa fa-check mo-text__success" />
          <i v-else class="fa fa-times mo-text__danger" />
        </template>
      </mo-table>
    </template>
    <template #footer-left>
      <mo-button
        class="mr-2"
        @click="$router.push('/admin/device/modem/new')"
        title="Add new modem"
        width="280px"
      />
      <template v-if="selected.length > 0">
        <mo-button
          class="mr-2"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-modems-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  deleteModem,
  getModemConfig,
  getModems
} from "@/api/admin/device/modem";
import { formatDate } from "@/utils/utils";

export default {
  name: "Modems",
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
        { key: "id", label: "ID" },
        {
          key: "point_of_sale",
          label: "PoS",
          formatter: item => (item ? item.name : "-")
        },
        {
          key: "company_name",
          label: "Company",
          formatter: value => value || "-"
        },
        {
          key: "modem_serial",
          label: "Serial number",
          formatter: value => value || "-"
        },
        { key: "modem_model", label: "Model" },
        { key: "created_at", label: "Created" },
        { key: "status", label: "Status", sortable: false },
        { key: "config", label: "Config", sortable: false },
        { key: "activated", label: "Activated", sortable: false },
        { key: "options", label: "" }
      ]
    };
  },
  computed: {
    deleteMessage() {
      return `Are you sure you want to delete ${this.selected.length} modems ?`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    formatDate: formatDate,
    onDownloadConfig(id, hostname) {
      getModemConfig(id).then(response => {
        let objectUrl = window.URL.createObjectURL(response.data);
        let anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = `config-${hostname}.rsc`;
        anchor.click();
        window.URL.revokeObjectURL(objectUrl);
      });
    },
    onEdit(id) {
      this.$router.push(`/admin/device/modem/${id}`);
    },
    onDelete() {
      this.$bvModal.hide("delete-modems-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteModem(id)),
        "modem"
      );
    },
    fetchData() {
      this.handleFetch(getModems()).then(res => {
        this.items = res;
      });
    }
  }
};
</script>
<style lang="scss">
.mo-modems-table {
  td:nth-child(10) {
    text-align: center !important;
  }
}
</style>
