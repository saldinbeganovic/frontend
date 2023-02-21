<template>
  <b-col>
    <b-row class="mo-uptime-table">
      <b-table
        class="mo-table mo-uptime-table w-100 h-100"
        thead-class="mo-logs-table__head"
        empty-text="No uptime logs to show"
        :items="dataProvider"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
        sticky-header="600px"
        show-empty
        striped
        hover
      >
        <template #cell(state)="{item}">
          <mo-status-badge
            :title="item.state ? 'Online' : 'Offline'"
            :variant="item.state ? 'success' : 'danger'"
            :clickable="false"
          />
        </template>
      </b-table>
    </b-row>
    <b-row class="mo-uptime-table__pagination mt-2">
      <b-pagination
        v-model="currentPage"
        class="m-0"
        :total-rows="totalRows"
        :per-page="perPage"
        aria-controls="log-table"
      ></b-pagination>
    </b-row>
  </b-col>
</template>

<script>
import { getUptime } from "@/api/shared/player/uptime";
import { formatDate } from "@/utils/utils";

export default {
  name: "MoUptime",
  props: {
    playerId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      currentPage: 1,
      totalRows: null,
      perPage: 50,
      items: [],
      fields: [
        {
          sortable: false,
          key: "state",
          label: "State"
        },
        {
          sortable: false,
          key: "created_at",
          label: "Date and Time",
          formatter: value => formatDate(value, true,false,true)
        }
      ]
    };
  },
  methods: {
    dataProvider(ctx) {
      const request = getUptime(this.playerId, ctx.perPage, ctx.currentPage);
      return this.handleFetch(request)
        .then(response => {
          this.totalRows = response.total;
          return response.data;
        })
        .catch(() => {
          return [];
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/variables";
.mo-uptime-table {
  max-height: 600px;
  height: 600px;
  border: 1px dashed #dddddd !important;
  border-radius: 10px;
  &__head {
    th {
      display: flex !important;
    }
  }
  &__pagination {
    height: 6vh;
  }
}
</style>
