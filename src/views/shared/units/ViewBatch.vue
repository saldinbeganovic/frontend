<template>
  <mo-dashboard title="Preview batch">
    <template #body>
      <form
        class="d-flex flex-column justify-content-between h-100 w-100 mo-manufacturer-unit-edit"
        @submit.prevent="onSubmit"
      >
        <mo-dashboard-body :loading="isLoading">
          <template #body>
            <mo-prompt-modal
              modal-id="confirm-batch-import-modal"
              message="Confirm import ?"
              description="By confirming batch import, you agree that all data is valid. After import all units of this batch will be added to your company. You cannot undo this action later."
              @left="$bvToast.hide('confirm-batch-import-modal')"
              @right="onConfirmImport"
            />
            <mo-assign-units-modal
              modal-id="assign-units-modal"
              @submit="onAssignSubmit"
            />
            <b-col>
              <b-row>
                <h4>General info</h4>
              </b-row>
              <b-row>
                <b-col>
                  <b-form-group class="w-100" label="Name" label-for="name">
                    <b-form-input
                      id="name"
                      v-model="name"
                      class="mo-input__light-sm"
                      placeholder="Name"
                      type="text"
                      :disabled="true"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group class="w-100" label="Note" label-for="note">
                    <b-form-input
                      id="note"
                      v-model="note"
                      class="mo-input__light-sm"
                      placeholder="Note"
                      type="text"
                      :disabled="true"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row class="mb-5 mt-5">
                <b-col>
                  <hr />
                </b-col>
              </b-row>
              <b-row>
                <h4>
                  Units <small>{{ totalUnits }}</small>
                </h4>
              </b-row>
              <b-row>
                <mo-table
                  empty-text="No units to show"
                  :search-query="searchQuery"
                  :items="units"
                  :fields="fields"
                  :loading="isLoading"
                  @select="selected = $event"
                  @edit="onViewUnit"
                  :show-select-all="!isPreview && !isAdminDashboard"
                >
                  <template #cell(cover_photo)="{item}">
                    <img v-if="item.image" :src="getImageUrl(item.image)" />
                    <i v-else class="fa fa-store mo-company-icon" />
                  </template>
                  <template #cell(point_of_sale_id)="{item}">
                    <mo-status-badge
                      :title="item.point_of_sale_id ? 'Assigned' : 'Unassigned'"
                      :variant="item.point_of_sale_id ? 'success' : 'info'"
                      :clickable="false"
                    />
                  </template>
                </mo-table>
              </b-row>
            </b-col>
          </template>
          <template v-if="!isAdminDashboard" #footer-right>
            <mo-button
              v-if="isPreview"
              type="submit"
              title="Confirm import"
              :loading="isSubmitting"
            />
            <mo-button
              v-else-if="selected.length > 0"
              type="submit"
              title="Assign to PoS"
              :loading="isSubmitting"
            />
          </template>
        </mo-dashboard-body>
      </form>
    </template>
  </mo-dashboard>
</template>

<script>
import {
  activateBatch,
  assignToPos,
  getBatch,
  getBatchPreview
} from "@/api/admin/company/unit/unit";
import MoAssignUnitsModal from "@/components/statefull/modals/MoAssignUnitsModal";

export default {
  name: "EditBatch",
  components: {
    MoAssignUnitsModal
  },
  data() {
    return {
      name: "",
      note: "",
      isSubmitting: false,
      isLoading: true,
      selected: [],
      units: [],
      fields: [
        { key: "cover_photo", label: "Image" },
        { key: "title", label: "Name" },
        { key: "point_of_sale_id", label: "Assigned" },
        { key: "options", label: "" }
      ]
    };
  },
  computed: {
    batchId() {
      return this.$route.params.batchId;
    },
    isPreview() {
      return this.$route.query.is_preview;
    },
    isNew() {
      return this.batchId === "new";
    },
    totalUnits() {
      return `(${this.units.length})`;
    }
  },
  mounted() {
    if (!this.isPreview && !this.isAdminDashboard) {
      this.fields = [{ key: "select", label: "Select" }, ...this.fields];
    }
    this.fetchData();
  },
  methods: {
    onAssignSubmit(posId) {
      this.handleFetch(
        assignToPos({
          point_of_sale_id: posId,
          units: this.selected
        })
      ).then(() => {
        this.fetchData();
        this.$bvModal.hide("assign-units-modal");
        this.$bvToast.toast(`Assigned ${this.selected.length} units to PoS!`);
      });
    },
    onSubmit() {
      if (this.isPreview) {
        this.$bvModal.show("confirm-batch-import-modal");
      } else {
        this.$bvModal.show("assign-units-modal");
      }
    },
    onViewUnit(unitId) {
      this.$router.push(`/${this.userPathPrefix}/unit/${unitId}`);
    },
    onConfirmImport() {
      this.handleFetch(
        activateBatch(this.batchId, {
          company_id: this.$store.getters.companyId
        })
      ).then(data => {
        this.$router.replace(`/user/batch/${data.id}`);
        setTimeout(() => {
          this.$bvToast.toast("Batch activated!");
        }, 200);
      });
    },
    fetchData() {
      if (this.isPreview) {
        this.handleFetch(getBatchPreview(this.batchId)).then(data => {
          this.name = data.name;
          this.note = data.notes;
          this.units = data.units;
        });
      } else {
        this.handleFetch(getBatch(this.batchId)).then(data => {
          this.name = data.name;
          this.note = data.notes;
          this.units = data.units;
        });
      }
    },
    getImageUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    }
  }
};
</script>
