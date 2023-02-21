<template>
  <mo-dashboard-body>
    <template #body>
      <mo-prompt-modal
        modal-id="delete-players-modal"
        :message="deleteMessage"
        @right="onDelete"
      />
      <mo-table
        table-class="mo-players-table"
        empty-text="No players to show"
        :fields="fields"
        :items="items"
        :search-query="searchQuery"
        :loading="isLoading"
        @select="selected = $event"
        @edit="onEdit"
      >
        <template #cell(notes)="{item}">
          <span :title="item.notes">{{ formatNote(item.notes) }}</span>
        </template>
        <template #cell(status)="{item}">
          <mo-status-badge
            :title="item.state ? 'Online' : 'Offline'"
            :variant="item.state ? 'success' : 'danger'"
            :clickable="false"
          />
        </template>
        <template #cell(activated)="{item}">
          <i v-if="item.unit" class="fa fa-check mo-text__success" />
          <i v-else class="fa fa-times mo-text__danger" />
        </template>
      </mo-table>
    </template>
    <template #footer-left>
      <mo-button
        class="mr-2"
        @click="$router.push('/admin/device/player/new')"
        title="Add new player"
        width="280px"
      />
      <template v-if="selected.length > 0">
        <mo-button
          class="mr-2"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-players-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { deletePlayer, getPlayers } from "@/api/admin/device/player";
import { formatText } from "@/utils/utils";

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
        { key: "id", label: "Id" },
        {
          key: "unit.point_of_sale.company.name",
          label: "Company"
        },
        {
          key: "unit.point_of_sale.address",
          label: "Point of sale"
        },
        {
          key: "unit.title",
          label: "Unit"
        },
        { key: "notes", label: "Note" },
        { key: "status", label: "Status", sortable: false },
        { key: "activated", label: "Activated", sortable: false },
        { key: "options", label: "" }
      ]
    };
  },
  computed: {
    modemId() {
      return this.$route.params.modemId;
    },
    deleteMessage() {
      return `Are you sure you want to delete ${this.selected.length} players ?`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    formatNote(value) {
      return formatText(value);
    },
    onEdit(id) {
      this.$router.push(`/admin/device/player/${id}`);
    },
    onDelete() {
      this.$bvModal.hide("delete-players-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deletePlayer(id)),
        "player"
      );
    },
    fetchData() {
      this.handleFetch(
        getPlayers().then(res => {
          this.items = res;
        })
      );
    }
  }
};
</script>
<style lang="scss">
.mo-players-table {
  td:nth-child(8) {
    text-align: center !important;
  }
}
</style>
