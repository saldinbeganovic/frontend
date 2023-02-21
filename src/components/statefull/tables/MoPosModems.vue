<template>
  <div class="w-100">
    <template>
      <mo-table
        empty-text="No modems to show"
        :fields="fields"
        :items="items"
        :search-query="searchQuery"
        :loading="isLoading"
      >
        <template #cell(status)="{item}">
          <mo-status-badge
            :title="item.state ? 'Online' : 'Offline'"
            :variant="item.state ? 'success' : 'danger'"
            :clickable="false"
          />
        </template>
        <template #cell(actions)="{item}">
          <span>
            <b-button
              v-if="$store.getters.hasAdminRole"
              :id="`${item.id}-player-delete-item`"
              class="mo-table__delete"
              @click="$emit('delete', item.id)"
            >
              <i class="fas fa-trash mo-text__danger" />
            </b-button>
            <b-tooltip
              :target="`${item.id}-player-delete-item`"
              triggers="hover"
            >
              Delete modem
            </b-tooltip>
          </span>
        </template>
      </mo-table>
    </template>
  </div>
</template>

<script>
import { formatDate } from "@/utils/utils";
import { getModemsOfPos } from "@/api/admin/device/modem";

export default {
  name: "MoPosModems",
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
      fields: [
        { key: "modem_serial", label: "Serial number" },
        { key: "modem_model", label: "Model" },
        { key: "created_at", label: "Created", formatter: formatDate },
        { key: "status", label: "Status", sortable: false },
        { key: "actions", label: "Actions", sortable: false }
      ]
    };
  },
  computed: {
    posId() {
      return this.$route.params.posId;
    },
    isNew() {
      return this.posId === "new";
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      if (!this.isNew) {
        this.handleFetch(getModemsOfPos(this.posId)).then(res => {
          this.items = res;
        });
      }
    }
  }
};
</script>
