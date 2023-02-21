<template>
  <div>
    <h3 class="text-center">Select the screen</h3>
    <mo-dashboard-body>
      <template #body>
        <mo-table :items="items" :fields="fields">
          <template #cell(action)="{item}">
            <b-button class="mo-table__edit" @click="onChangeVideo(item)">
              <i class="far fa-exchange" />
            </b-button>
          </template>
        </mo-table>
      </template>
    </mo-dashboard-body>
  </div>
</template>

<script>
import {
  getPosUnits,
  getPosUnitsOfCompany
} from "@/api/admin/company/unit/unit";
export default {
  name: "SelectScreen",
  data() {
    return {
      items: [],
      fields: [
        {
          key: "brand.name",
          label: "Brand",
          filterable: true,
          collapsable: true,
          formatter: value => value || "-"
        },
        {
          key: "retailer.name",
          label: "Retailer",
          filterable: true,
          collapsable: true,
          formatter: value => value || "-"
        },
        {
          key: "city",
          label: "City",
          sortable: true,
          filterable: true,
          collapsable: true,
          formatter: value => value || "-"
        },
        {
          key: "country.name",
          label: "Country",
          sortable: true,
          filterable: true,
          collapsable: true,
          formatter: value => value || "-"
        },
        { key: "action", label: "Action" }
      ]
    };
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    getPosRequestData() {
      return {
        is_archived: 0,
        without_units: 0,
        has_player: 1
      };
    }
  },
  methods: {
    onChangeVideo(unit) {
      this.$emit("next", unit);
    },
    fetchData() {
      return this.handleFetch(
        this.isAdminDashboard
          ? getPosUnits(this.getPosRequestData)
          : getPosUnitsOfCompany(this.companyId, this.getPosRequestData)
      ).then(data => {
        this.items = data.map(e => ({ ...e, _showDetails: false }));
      });
    }
  }
};
</script>

<style lang="scss"></style>
