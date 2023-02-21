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
      <h5>Archived maintenances</h5>
      <mo-table
        empty-text="No archived service requests to show"
        table-class="mo-maintenance-table mo-table__multiple"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        :fixed="true"
        :show-edit-button="false"
      >
        <template #options="{item}">
          <span v-if="item.pdf_path">
            <b-button class="mo-table__edit" @click="onOpenPdf(item.pdf_path)">
              <i class="far fa-file-pdf" />
            </b-button>
          </span>
          <b-button class="mo-table__edit" @click="onEdit(item.id)">
            <i class="far fa-eye" />
          </b-button>
        </template>
        <template #cell(status)="{item}">
          <mo-select-badge
            width="120px"
            :disabled="true"
            :value="item.status"
            :variant="badgeVariants[item.status]"
            :options="statusOptions"
            @change="onUpdateStatus(item.id, $event)"
          />
        </template>
      </mo-table>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { getArchivedMaintenancesOfCompany } from "@/api/user/service";
import { formatDate } from "@/utils/utils";
import MoEditMaintenanceModal from "@/views/user/maintenance/EditMaintenance";

export default {
  name: "ServiceArchive",
  components: { MoEditMaintenanceModal },
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      currentEditStatusId: null,
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
        { key: "unit.title", label: "Unit", sortable: true, filterable: true },

        { key: "description", label: "Description" },
        { key: "status", label: "Status", sortable: false },

        { key: "options" }
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
    fetchData() {
      this.handleFetch(getArchivedMaintenancesOfCompany(this.companyId)).then(
        data => {
          this.items = data;
        }
      );
    },
    onEdit(id) {
      this.$refs.editMaintenanceModal.show({
        maintenanceId: id
      });
    }
  }
};
</script>
