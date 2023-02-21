<template>
  <mo-dashboard-body>
    <template #body>
      <mo-prompt-modal
        modal-id="delete-units-modal"
        :message="`Are you sure you want to delete ${selected.length} units ?`"
        @right="onDelete"
      />
      <mo-prompt-modal
        modal-id="archive-units-modal"
        :message="`Are you sure you want to archive ${selected.length} units ?`"
        @right="onArchive"
      />
      <mo-table
        empty-text="No units to show. To add new Units, you must first create a Point of Sale in order to assign them."
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        table-class="mo-units-table"
        @select="selected = $event"
        @edit-item="
          onEdit($event.company_id, $event.point_of_sale_id, $event.id)
        "
      >
        <template #cell(cover_photo)="{item}">
          <img
            v-if="item.cover_photo"
            :src="getImageUrl(item.cover_photo)"
            alt=""
          />
          <i
            v-else
            class="fa fa-store mo-company-icon"
            style="font-size: 30px"
          />
        </template>
        <template #cell(status)="{item}">
          <mo-status-badge
            :variant="statusVariant(item.active_players, item.inactive_players)"
            :clickable="false"
            :title="
              statusTitle(
                item.active_players,
                item.inactive_players,
                'No players'
              )
            "
          />
        </template>
      </mo-table>
    </template>
    <template v-if="selected.length > 0 && canDelete" #footer-left>
      <mo-button
        title="Delete"
        variant="danger"
        @click="$bvModal.show('delete-units-modal')"
      />
      <mo-button
        title="Archive"
        class="ml-2"
        @click="$bvModal.show('archive-units-modal')"
      />
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  deleteUnit,
  getUnits,
  getUnitsOfCompany
} from "@/api/admin/company/unit/unit";
import { archiveUnit } from "../../../api/admin/company/unit/unit";

export default {
  name: "Units",
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
        { key: "cover_photo", label: "Image" },
        { key: "title", label: "Name" },
        {
          key: "point_of_sale.name",
          label: "Point of Sale",
          formatter: value => value || "-"
        },
        { key: "status", label: "Player status", sortable: false },
        { key: "options", label: "" }
      ]
    };
  },
  computed: {
    canDelete() {
      return this.$store.getters.hasAdminRole;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onArchive() {
      this.$bvModal.hide("archive-units-modal");
      this.handleMultipleArchive(
        this.selected.map(id => archiveUnit(id)),
        "Units"
      ).then(() => {
        this.$emit("refetch");
      });
    },
    fetchData() {
      this.handleFetch(
        this.isAdminDashboard ? getUnits() : getUnitsOfCompany(this.companyId)
      ).then(data => {
        this.items = data;
      });
    },
    onEdit(companyId, posId, unitId) {
      if (posId) {
        this.$router.push(
          `/${
            this.isAdminDashboard
              ? `admin/company/${companyId}`
              : this.companyPathPrefix
          }/pos/${posId}?unitId=${unitId}`
        );
      } else {
        this.$router.push(
          `/${this.isAdminDashboard ? "admin" : "user"}/unit/${unitId}`
        );
      }
    },
    getImageUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    },
    onDelete() {
      this.$bvModal.hide("delete-units-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteUnit(id)),
        "Units"
      );
    }
  }
};
</script>
<style lang="scss">
.mo-units-table {
  td:nth-child(2) {
    text-align: center;
  }
}
</style>
