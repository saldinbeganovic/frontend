<template>
  <dashboard title="Companies" @search="searchQuery = $event">
    <template #body>
      <mo-prompt-modal
        modal-id="delete-companies-modal"
        :message="deleteMessage"
        @right="onDelete"
      />
      <mo-prompt-modal
        modal-id="block-companies-modal"
        :message="blockMessage"
        @right="onBlock"
      />
      <mo-dashboard-body>
        <template #body>
          <mo-table
            empty-text="No companies to show"
            :fields="fields"
            :items="items"
            :loading="isLoading"
            :search-query="searchQuery"
            table-class="mo-companies-table"
            @select="selected = $event"
            @edit="onEdit"
          >
            <template #cell(logo)="{item}">
              <img
                v-if="item.logo"
                :alt="item.company_name"
                :src="getImageUrl(item.logo)"
              />
              <i v-else class="fa fa-building mo-company-icon" />
            </template>
            <template #cell(is_blocked)="{item}">
              <mo-status-badge
                :title="item.is_blocked ? 'Blocked' : 'Active'"
                :variant="item.is_blocked ? 'danger' : 'success'"
              />
            </template>
          </mo-table>
        </template>
        <template #footer-left>
          <mo-button
            class="mr-2"
            @click="$router.push('/admin/company/new')"
            title="Add new"
          />
          <template v-if="selected.length > 0">
            <mo-button
              class="mr-2"
              title="Block"
              @click="$bvModal.show('block-companies-modal')"
            />
            <mo-button
              class="mr-2"
              title="Delete"
              variant="danger"
              @click="$bvModal.show('delete-companies-modal')"
            />
          </template>
        </template>
      </mo-dashboard-body>
    </template>
  </dashboard>
</template>
<script>
import Dashboard from "@/layouts/MoDashboard";
import {
  blockCompany,
  deleteCompany,
  getCompanies
} from "@/api/admin/company/company";

export default {
  name: "Companies",
  components: {
    Dashboard
  },
  data() {
    return {
      isLoading: true,
      items: [],
      selected: [],
      searchQuery: "",
      fields: [
        { key: "select", label: "" },
        { key: "logo", label: "Logo" },
        { key: "name", label: "Group name" },
        { key: "brand", label: "Brand" },
        { key: "is_blocked", label: "Status" },
        { key: "options", label: "" }
      ]
    };
  },
  computed: {
    deleteMessage() {
      return `Are you sure you want to delete ${this.selected.length} companies ?`;
    },
    blockMessage() {
      return `Are you sure you want to block ${this.selected.length} companies ?`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onEdit(id) {
      this.$router.push(`/admin/company/${id}`);
    },
    onBlock() {
      this.$bvModal.hide("block-companies-modal");
      Promise.all(this.selected.map(id => blockCompany(id)))
        .then(() => {
          this.$bvToast.toast(
            `You successfully blocked ${this.selected.length} companies`,
            { title: "Successfully blocked!" }
          );
        })
        .catch(e => {
          this.$bvToast.toast(e.message, {
            title: "Block failed",
            variant: "danger"
          });
        });
    },
    onDelete() {
      this.$bvModal.hide("delete-companies-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteCompany(id)),
        "Companies"
      ).then(() => {
        this.fetchData();
      });
    },
    fetchData() {
      this.handleFetch(getCompanies()).then(res => {
        this.items = res;
      });
    },
    getImageUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    }
  }
};
</script>
<style lang="scss">
.mo-company-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}
.mo-companies-table {
  td:nth-child(2),
  td:nth-child(3) {
    text-align: center;
  }
  td:nth-child(4),
  td:nth-child(5) {
    max-width: 100px;
  }
}
</style>
