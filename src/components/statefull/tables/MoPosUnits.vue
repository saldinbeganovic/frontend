<template>
  <div class="w-100">
    <template>
      <mo-prompt-modal
        modal-id="delete-units-modal"
        :message="`Are you sure you want to delete ${selected.length} units ?`"
        @right="onDelete"
      />
      <mo-table
        empty-text="No units to show"
        :search-query="searchQuery"
        table-class="mo-units-pos-table"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        @select="selected = $event"
        @edit="onEdit"
      >
        <template #cell(cover_photo)="{item}">
          <img v-if="item.cover_photo" :src="getImageUrl(item.cover_photo)" />
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
        <template #cell(title)="{item}">
          <a href="#" @click.prevent="onEdit(item.id)">{{ item.title }}</a>
        </template>
      </mo-table>
    </template>
    <template v-if="selected.length > 0">
      <mo-button
        v-if="$store.getters.hasAdminRole"
        class="mt-2 unit-delete-button"
        title="Delete"
        variant="danger"
        @click="$bvModal.show('delete-units-modal')"
      />
    </template>
  </div>
</template>

<script>
import { archiveUnit } from "@/api/admin/company/unit/unit";
import { getUnitsOfPos } from "@/api/admin/company/point-of-sale";

export default {
  name: "MoPosUnits",
  props: {
    searchQuery: {
      type: String,
      required: true,
      default: ""
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
        { key: "status", label: "Player status", sortable: false }
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
        this.handleFetch(getUnitsOfPos(this.posId))
          .then(data => {
            this.items = data;
          })
          .finally(() => this.$emit("fetched"));
      }
    },
    onEdit(unitId) {
      this.$emit("edit", unitId);
    },
    getImageUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    },
    onDelete() {
      this.$bvModal.hide("delete-units-modal");
      this.handleMultipleDelete(
        this.selected.map(id => archiveUnit(id)),
        "Units"
      );
    }
  }
};
</script>
<style lang="scss">
.unit-delete-button {
  right: 0px;
  position: absolute;
}
.mo-units-pos-table {
  max-height: 600px !important;
  height: auto;
  .cover_photo {
    text-align: center;
  }
}
</style>
