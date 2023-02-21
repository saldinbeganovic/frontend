<template>
  <mo-dashboard-body>
    <template #body>
      <mo-prompt-modal
        modal-id="delete-imported-tech-data-unit"
        :message="`Are you sure you want to delete this imported unit ?`"
        description="This will permanently delete this unit."
        @right="onConfirmDelete"
      />
      <mo-screen-wrapper-modal ref="editUnitModal" #body="{props}">
        <edit-unit :unit-id="props.unitId" />
      </mo-screen-wrapper-modal>
      <mo-request-data-modal
        modal-id="request-producer-modal"
        @done="$bvModal.hide('request-producer-modal')"
      />
      <mo-assign-units-modal
        modal-id="assign-unit-modal"
        @submit="onSubmitAssign"
      />
      <mo-import-batch-modal
        modal-id="import-batch-modal"
        @submit="onImportBatch"
      />

      <mo-table
        empty-text="No batches to show"
        table-class="mo-imported-units-table"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        @select="selected = $event"
        :show-select-all="false"
        @edit-item="onEdit($event)"
      >
        <template #options="{item}">
          <b-button
            v-if="$store.getters.hasAdminRole"
            :id="`${item.id}-button-delete-imported`"
            class="mo-table__delete"
            @click="onDelete(item)"
          >
            <i class="far fa-trash" />
          </b-button>
          <b-tooltip
            :target="`${item.id}-button-delete-imported`"
            triggers="hover"
          >
            Delete imported unit
          </b-tooltip>
          <b-button
            v-if="$store.getters.hasAdminRole"
            :id="`${item.id}-button-assign-to-pos`"
            class="mo-table__edit"
            @click="onAssignToPos(item)"
          >
            <i class="far fa-house" />
          </b-button>
          <b-tooltip
            :target="`${item.id}-button-assign-to-pos`"
            triggers="hover"
          >
            Assign this unit to a Point of Sale
          </b-tooltip>
        </template>
        <template #cell(pivot)="{item}">
          <router-link :to="`/${userPathPrefix}/batch/${item.pivot.batch_id}`">
            {{ item.batches[0].name }}
          </router-link>
        </template>
        <template #cell(point_of_sale)="{item}">
          <router-link
            v-if="item.point_of_sale"
            :to="`/${companyPathPrefix}/pos/${item.point_of_sale_id}`"
          >
            {{ item.point_of_sale.name }}
          </router-link>
          <i
            v-else
            v-b-tooltip.hover
            title="Unit not assigned to PoS yet."
            style="color: orange"
            class="fas fa-exclamation-triangle "
          />
        </template>
      </mo-table>
    </template>
    <template #footer-left>
      <!-- <mo-button
        @click="$bvModal.show('import-batch-modal')"
        title="Import tech data for units"
      
      /> -->
    </template>
    <template #footer-right>
      <mo-button
        v-if="isCompanyDashboard && $store.getters.hasAdminRole"
        @click="$bvModal.show('request-producer-modal')"
        title="Ask producer for
      technical data of the unit"
        width="480px"
      />
    </template>
  </mo-dashboard-body>
</template>

<script>
import { formatDate } from "@/utils/utils";
import {
  getImportedUnits,
  getImportedUnitsOfCompany
} from "@/api/admin/company/company";
import { assignToPos, getBatchPreview } from "@/api/admin/company/unit/unit";
import MoAssignUnitsModal from "../../../components/statefull/modals/MoAssignUnitsModal";
import MoImportBatchModal from "@/components/pure/modals/MoImportBatchModal";
import MoRequestDataModal from "@/components/statefull/modals/MoRequestDataModal";
import EditUnit from "@/views/shared/pos/EditUnit";
import { deleteUnit } from "@/api/admin/company/unit/unit";

export default {
  name: "Batches",
  components: {
    EditUnit,
    MoRequestDataModal,
    MoImportBatchModal,
    MoAssignUnitsModal
  },
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
      // unit that is currently being assigned to PoS or deleted
      currentUnitId: null,
      items: [],
      fields: [
        { key: "title", label: "Title" },
        { key: "point_of_sale", label: "PoS" },
        { key: "pivot", label: "Batch" },
        {
          key: "created_at",
          label: "Created",
          formatter: value => formatDate(value, false)
        },
        { key: "options", label: "" }
      ]
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onImportBatch(code) {
      this.$bvModal.hide("import-batch-modal");
      getBatchPreview(code)
        .then(() => {
          this.$router.push(`/user/batch/${code}?is_preview=true`);
        })
        .catch(e => {
          if (e.response.status === 404) {
            this.$bvToast.toast("Batch not found!", { variant: "danger" });
          } else {
            this.$bvToast.toast("Unknown error", { variant: "danger" });
          }
        });
    },
    fetchData() {
      this.handleFetch(
        this.isAdminDashboard
          ? getImportedUnits()
          : getImportedUnitsOfCompany(this.$store.getters.companyId)
      ).then(data => {
        this.items = data.map(e => ({ ...e, hideOptions: !!e.deleted_at }));
      });
    },
    onEdit(item) {
      item.point_of_sale_id
        ? this.$router.push(
            `/${this.companyPathPrefix}/pos/${item.point_of_sale_id}?unitId=${item.id}`
          )
        : this.$refs.editUnitModal.show({
            unitId: item.id
          });
    },
    onAssignToPos(item) {
      this.currentUnitId = item.id;
      this.$bvModal.show("assign-unit-modal");
    },
    onDelete(item) {
      this.$bvModal.show("delete-imported-tech-data-unit");
      this.currentUnitId = item.id;
    },
    onConfirmDelete() {
      this.handleDelete(deleteUnit(this.currentUnitId), "Unit").then(() =>
        this.fetchData()
      );
      this.currentUnitId = null;
    },
    onSubmitAssign(posId) {
      this.handleFetch(
        assignToPos({
          point_of_sale_id: posId,
          units: [this.currentUnitId]
        })
      ).then(() => {
        this.fetchData();
        this.$bvModal.hide("assign-unit-modal");
        this.$bvToast.toast(`Assigned unit to PoS!`);
      });
    }
  }
};
</script>
<style lang="scss">
.mo-imported-units-table {
  margin-bottom: 3rem;
  td:nth-child(2),
  td:nth-child(3),
  td:nth-child(4),
  td:nth-child(5) {
    max-width: 150px;
  }
}
</style>
