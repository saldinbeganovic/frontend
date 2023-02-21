<template>
  <mo-dashboard-body @search="searchQuery = $event">
    <template #body>
      <mo-table
        empty-text="No units to show"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        table-class="mo-units-table"
        @select="selected = $event"
        @edit="onEdit"
      >
        <template #cell(cover_photo)="{item}">
          <img
            v-if="item.cover_photo"
            :src="getImageUrl(item.cover_photo)"
            alt=""
          />
          <i v-else class="fa fa-store mo-company-icon" />
        </template>
        <template #cell(duplicate)="{item}">
          <b-button
            title="Duplicate this unit."
            class="mo-table__edit"
            @click="onDuplicate(item.id)"
          >
            <i class="fas fa-copy" />
          </b-button>
        </template>
        <template #cell(editable)="{item}">
          <i v-if="!item.editable" class="fa fa-check mo-text__success" />
          <i v-else class="fa fa-times mo-text__danger" />
        </template>
      </mo-table>
    </template>
    <template #footer-left>
      <mo-button class="mr-2" @click="onAddUnit" title="Add unit" />
      <template v-if="selected.length > 0">
        <mo-button
          v-if="$store.getters.hasAdminRole"
          title="Delete"
          variant="danger"
          @click="$bvModal.show('delete-units-modal')"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { getManufacturerUnits } from "@/api/manufacturer";

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
        { key: "id", label: "ID", formatter: value => `#${value}` },
        { key: "cover_photo", label: "Image" },
        { key: "title", label: "Name" },
        { key: "editable", label: "Imported" },
        { key: "duplicate", label: "" },
        { key: "options", label: "" }
      ]
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.handleFetch(getManufacturerUnits()).then(data => {
        this.items = data;
      });
    },
    onEdit(unitId) {
      this.$router.push(`/manufacturer/unit/${unitId}`);
    },
    onDuplicate(unitId) {
      this.$router.push(`/manufacturer/unit/new?duplicate=${unitId}`);
    },
    getImageUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    },
    onAddUnit() {
      this.$router.push("/manufacturer/unit/new");
    }
  }
};
</script>
<style lang="scss">
.mo-units-table {
  td:nth-child(6),
  td:nth-child(3) {
    text-align: center;
  }
}
</style>
