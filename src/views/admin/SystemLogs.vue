<template>
  <mo-dashboard title="System logs" @search="filter = $event">
    <template #body>
      <b-modal
        id="preview-data-modal"
        content-class="mo-input-modal"
        body-class="mo-input-modal-body p-0"
        hide-footer
        hide-header
        centered
      >
        <b-row class="w-100">
          <pre class="m-0">{{ previewData }}</pre>
        </b-row>
      </b-modal>
      <mo-dashboard-body>
        <template #body>
          <b-col style="">
            <b-row class="mo-logs-table">
              <b-table
                style="max-height:550px !important;"
                id="log-table"
                ref="logTable"
                class="mo-table mo-logs-table w-100 log-table"
                thead-class="mo-logs-table__head"
                empty-text="No logs to show"
                :busy.sync="isBusy"
                :items="dataProvider"
                :fields="fields"
                :loading="isLoading"
                :current-page="currentPage"
                :per-page="perPage"
                sticky-header
                show-empty
                striped
                hover
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
              >
                <template #cell(status)="{item}">
                  <span
                    :class="
                      item.status >= 400
                        ? 'mo-text__danger'
                        : 'mo-text__success'
                    "
                    >{{ item.status }}</span
                  >
                </template>
                <template #cell(user.is_admin)="{item}">
                  <span v-if="item.user.is_admin">ADMIN</span>
                  <span v-else>USER</span>
                </template>
                <template #cell(user)="{item}">
                  <a href="#" @click.prevent="onGoToUser(item)"
                    >{{ item.user.first_name }} {{ item.user.last_name }}</a
                  >
                </template>
                <template #cell(before)="{item}">
                  <b-button
                    class="mo-plain-button"
                    variant="light"
                    @click="onShowData(item, 'before')"
                    >Before data</b-button
                  >
                </template>
                <template #cell(after)="{item}">
                  <b-button
                    class="mo-plain-button"
                    variant="light"
                    @click="onShowData(item, 'after')"
                    >After data</b-button
                  >
                </template>
              </b-table>
            </b-row>
            <b-row class="mo-logs-table__pagination">
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
      </mo-dashboard-body>
    </template>
  </mo-dashboard>
</template>
<script>
import { getLogs } from "@/api/admin/logs";
import { formatDate } from "@/utils/utils";

export default {
  name: "SystemLogs",
  data() {
    return {
      filter: "",
      sortBy: "",
      sortDesc: false,
      isBusy: false,
      isLoading: true,
      currentPage: 1,
      totalRows: null,
      perPage: 50,
      items: [],
      previewData: null,
      fields: [
        {
          sortable: true,
          key: "action",
          label: "Action",
          formatter: s => (s ? s.toUpperCase() : "-")
        },
        {
          sortable: true,
          key: "status",
          label: "Status",
          formatter: s => s || "-"
        },
        {
          key: "parameters",
          label: "Parameters",
          formatter: s => s || "-",
          sortable: true
        },
        { key: "user.is_admin", label: "User type" },
        { key: "user", label: "User" },
        { key: "before", label: "Before", formatter: s => s || "-" },
        { key: "after", label: "After", formatter: s => s || "-" },
        {
          sortable: true,
          key: "created_at",
          label: "Date",
          formatter: value => formatDate(value, true, false, true)
        }
      ]
    };
  },
  watch: {
    filter() {
      this.$refs.logTable.refresh();
    },
    sortBy() {
      this.$refs.logTable.refresh();
    },
    sortByDesc() {
      this.$refs.logTable.refresh();
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onGoToUser(item) {
      if (!item.user.company_id) {
        return this.$bvToast.toast(
          "Can't navigate to user profile, because his group was removed!",
          { variant: "info" }
        );
      }
      this.$router.push(
        `/admin/company/${item.user.company_id}/user/${item.user.id}`
      );
    },
    fetchData() {
      this.handleFetch(getLogs()).then(data => {
        this.items = data.data;
      });
    },
    onShowData(item, field) {
      this.previewData = JSON.stringify(item[field], null, 4);
      this.$bvModal.show("preview-data-modal");
    },
    dataProvider(ctx) {
      this.isBusy = true;
      const request = getLogs(
        ctx.perPage,
        ctx.currentPage,
        this.sortBy,
        this.sortDesc ? "desc" : "asc",
        this.filter
      );
      return this.handleFetch(request)
        .then(response => {
          this.isBusy = false;
          this.totalRows = response.total;
          return response.data;
        })
        .catch(() => {
          this.isBusy = false;
          return [];
        });
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../../assets/scss/variables";
$mo-logs-pagination-height: 6vh;
$mo-logs-table-height: calc(
  #{$mo-content-height} - #{$mo-logs-pagination-height} - 10px
);
.mo-logs-table {
  max-height: $mo-logs-table-height;
  &__head {
    th {
      display: flex !important;
    }
  }
  &__pagination {
    height: $mo-logs-pagination-height;
  }
}
.log-table{
 max-height:550px !important; 

}
</style>
