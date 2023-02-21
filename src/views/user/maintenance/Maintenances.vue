<template>
  <mo-dashboard-body aligned-class="mo-maintenance-table__aligned">
    <template #body>
      <mo-screen-wrapper-modal ref="editMaintenanceModal" #body="{props}">
        <mo-edit-maintenance-modal
          modal-id="edit-maintenance-modal"
          :maintenance-id="props.maintenanceId"
          @exit="onExitEdit"
        />
      </mo-screen-wrapper-modal>
      <mo-screen-wrapper-modal ref="pdfWrapperModal" #body="{props}">
        <iframe :src="toS3Url(props.pdf)" class="pdf-view"> </iframe>
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="archive-maintenance-modal"
        message="Are you sure you want to complete and archive this maintenance request ? You can't undo this action."
        @right="onArchive"
        @left="onArchiveCancel"
      />
      <h5>Maintenances</h5>

      <mo-table
        empty-text="No maintenances to show"
        table-class="mo-maintenance-table mo-table__multiple"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        :fixed="true"
        :show-edit-button="false"
      >
        <template #cell(status)="{item}">
          <mo-select-badge
            width="120px"
            :disabled="!$store.getters.hasAdminRole"
            :value="item.status"
            :variant="badgeVariants[item.status]"
            :options="statusOptions"
            @change="onUpdateStatus(item.id, $event)"
          />
        </template>
        <template #options="{item}">
          <span v-if="item.pdf_path">
            <b-button class="mo-table__edit" @click="onOpenPdf(item.pdf_path)">
              <i class="far fa-file-pdf" />
            </b-button>
          </span>
          <span>
            <b-button class="mo-table__edit" @click="onEdit(item.id)">
              <i class="far fa-eye" />
            </b-button>
          </span>
        </template>

        <template #cell(unit.point_of_sale.name)="{item}">
          <b-container v-if="item.unit">
            <b-row
              class="justify-content-center"
              v-if="item.unit.point_of_sale"
            >
              <b-col class="my-auto">
                <div
                  style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                >
                  <router-link
                    :title="item.unit.point_of_sale.name"
                    :to="`/user/pos/${item.unit.point_of_sale.id}`"
                  >
                    {{ item.unit.point_of_sale.name }}
                  </router-link>
                </div>
              </b-col>
            </b-row>
          </b-container>
        </template>

        <template #cell(unit.title)="{item}">
          <router-link
            :to="
              `/${companyPathPrefix}/pos/${item.unit.point_of_sale.id}?unitId=${item.unit.id}`
            "
            :title="item.unit.title"
            v-if="item.unit"
            >{{ item.unit.title }}
          </router-link>
          <span v-else>-</span>
        </template>
      </mo-table>
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  getMaintenancesOfCompany,
  updateMaintenance
} from "@/api/user/service";
import { formatDate, formatText } from "@/utils/utils";
import MoEditMaintenanceModal from "@/views/user/maintenance/EditMaintenance";

export default {
  name: "Services",
  components: { MoEditMaintenanceModal },
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      tempMaintenanceId: null,
      isLoading: true,
      currentEditStatusId: null,
      tempStatusId: null,
      items: [],
      badgeVariants: {
        1: "purple",
        2: "",
        3: "danger",
        4: "success"
      },
      badgeMessages: {
        1: "Sent",
        2: "In Progress",
        3: "Canceled",
        4: "Completed"
      },
      statusOptions: [
        { value: 1, text: "Sent" },
        { value: 2, text: "In Progress" },
        { value: 3, text: "Cancelled" },
        { value: 4, text: "Completed" }
      ],
      fields: [
        {
          key: "vendor.name",
          label: "Company",
          sortable: true,
          filterable: true
        },
        {
          key: "id",
          label: "ID",
          formatter: value => `#${value}`
        },
        {
          key: "created_at",
          label: "Date",
          formatter: formatDate,
          sortable: true
        },
        {
          key: "unit.point_of_sale.brand.name",
          label: "Brand",
          sortable: true,
          filterable: true
        },
        {
          key: "unit.point_of_sale.retailer.name",
          label: "Retailer",
          sortable: true,
          filterable: true
        },
        {
          key: "unit.point_of_sale.city",
          label: "City",
          sortable: true,
          filterable: true
        },
        {
          key: "unit.point_of_sale.country.name",
          label: "Country",
          sortable: true,
          filterable: true
        },
        {
          key: "unit.point_of_sale.name",
          label: "PoS",
          sortable: true,
          filterable: true
        },
        {
          key: "unit.title",
          label: "Unit",
          sortable: true,
          filterable: true
        },

        {
          key: "description",
          label: "Description",
          sortable: true,

          formatter: value => formatText(value, 35)
        },
        {
          key: "status",
          label: "Status",
          sortable: true
        },
        {
          key: "options",
          label: "Options"
        }
      ]
    };
  },
  computed: {
    companyId() {
      return this.$store.getters.companyId;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onOpenPdf(pdfPath) {
      this.$refs.pdfWrapperModal.show({ pdf: pdfPath });
    },
    onExitEdit() {
      this.$refs.editMaintenanceModal.hide();
      this.fetchData();
    },
    onAddNew() {
      this.onEdit("new");
    },
    onEdit(id) {
      this.$refs.editMaintenanceModal.show({
        maintenanceId: id
      });
    },
    onArchive() {
      this.handleArchive(
        updateMaintenance(this.currentEditStatusId, {
          status: this.tempStatusId
        }),
        "Maintenance"
      ).then(() => {
        this.currentEditStatusId = null;
        this.$emit("refetch-archive");
      });
    },
    onArchiveCancel() {
      this.currentEditStatusId = null;
      this.tempStatusId = null;
      this.items = [];
      this.fetchData();
    },
    onUpdateStatus(id, status) {
      // archive cancelled & completed maintenances (with id's 3 & 4)
      if (status === "4" || status === "3") {
        this.currentEditStatusId = id;
        this.tempStatusId = status;
        return this.$bvModal.show("archive-maintenance-modal");
      }
      updateMaintenance(id, { status })
        .then(() => {
          this.fetchData();
          this.$bvToast.toast(
            `Status updated to: ${this.badgeMessages[status]}`
          );
        })
        .catch(() => {
          this.$bvToast.toast("Status update failed", { variant: "danger" });
        });
    },
    fetchData() {
      this.handleFetch(getMaintenancesOfCompany(this.companyId)).then(data => {
        this.items = data;
      });
    }
  }
};
</script>
<style lang="scss">
.pdf-view {
  height: 90vh;
  width: 100%;
}
.mo-maintenance-table {
  &__aligned {
    height: auto !important;
  }
  th label {
    display: flex;
    justify-content: center;
    margin: 0;
    select {
      font-size: 10px;
    }
  }
  td {
    text-align: center;
    font-size: 0.7rem !important;
  }
  .id {
    width: 70px;
  }
  .vendor-name,
  .created_at,
  .unit-point_of_sale-brand-name,
  .unit-point_of_sale-retailer-name,
  .unit-point_of_sale-city,
  .unit-point_of_sale-name,
  .unit-title,
  .status,
  .options {
    width: 150px;
  }

  .description {
    width: 190px;
  }

  .unit-point_of_sale-country-name {
    width: 120px;
  }
}
</style>
