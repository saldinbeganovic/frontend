<template>
  <validation-observer class="h-100 flex-grow-1" v-slot="{ handleSubmit }">
    <form
      class="d-flex flex-column justify-content-between h-100"
      @submit.prevent="handleSubmit(onSubmit)"
    >
      <mo-dashboard-body :is-footer-top="false" :loading="isLoading">
        <template #body>
          <mo-file-modal
            modal-id="maintenance-request-images-modal"
            api-endpoint="/api/service-requests/upload"
            @success="onFileUploaded"
          />
          <b-col class="mx-4 mb-3">
            <b-row class="mb-3">
              <h2 class="text-center w-100">Order maintenance</h2>
            </b-row>
            <b-row class="mb-3">
              <b-col>
                <b-form-group class="w-100" label="POS" label-for="pos">
                  <b-form-select
                    id="pos"
                    v-model="posId"
                    class="mo-input__light-sm"
                    :options="posItems"
                    :disabled="!canChangePosAndUnit || !isNew"
                    required
                  ></b-form-select>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group class="w-100" label="Unit" label-for="unit">
                  <b-form-select
                    id="unit"
                    v-model="unitId"
                    class="mo-input__light-sm"
                    :options="unitItems"
                    :disabled="!posId || !canChangePosAndUnit || !isNew"
                    required
                  ></b-form-select>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-form-group
                  class="w-100"
                  label="Service company"
                  label-for="service-company"
                >
                  <b-form-select
                    id="service-company"
                    v-model="vendorId"
                    class="mo-input__light-sm"
                    :options="vendorItems"
                    :disabled="!isNew"
                    required
                  ></b-form-select>
                </b-form-group>
                <router-link
                  v-if="isNew"
                  to="/user/profile?new=true#maintenance-vendors"
                >
                  <i class="fas fa-plus" />
                  Add new company
                </router-link>
              </b-col>
              <b-col>
                <b-form-group
                  class="w-100"
                  label="Description"
                  label-for="description"
                >
                  <b-form-textarea
                    id="description"
                    class="mo-input__light-sm"
                    v-model="description"
                    :disabled="!isNew"
                    placeholder="Text..."
                    rows="4"
                    max-rows="12"
                  ></b-form-textarea>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <h4>Attachments</h4>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <mo-attachment-list
                  v-if="imageList.length > 0"
                  :items="imageList"
                  :disabled="!isNew"
                  @delete-item="onDeleteImage"
                />
                <div v-else>
                  No attachments added yet
                </div>
              </b-col>
            </b-row>
          </b-col>
        </template>
        <template v-if="isNew" #footer-left>
          <mo-button
            class="ml-5"
            title="Upload images"
            outline
            @click="$bvModal.show('maintenance-request-images-modal')"
          />
        </template>
        <template #footer-right>
          <mo-button
            v-if="created"
            class="mr-2"
            title="Add another"
            @click="onAddAnother"
          />
          <mo-button
            v-if="isNew"
            class="mr-5"
            type="submit"
            title="Create"
            :loading="isSubmitting"
          />
        </template>
      </mo-dashboard-body>
    </form>
  </validation-observer>
</template>

<script>
import { createMaintenance, getMaintenance } from "@/api/user/service";
import { getVendorsOfCompany } from "@/api/user/vendor";
import { getUnitsOfPos } from "@/api/admin/company/point-of-sale";

export default {
  name: "MoEditMaintenanceModal",
  props: {
    maintenanceId: {
      type: [Number, String],
      default: "new"
    },
    initialPosId: {
      type: Number,
      default: null
    },
    initialUnitId: {
      type: Number,
      default: null
    },
    canChangePosAndUnit: {
      default: true
    }
  },
  data() {
    return {
      isLoading: false,
      created: false,
      isSubmitting: false,
      posItems: [],
      unitItems: [],
      vendorItems: [],
      images: [],
      posId: this.initialPosId,
      unitId: this.initialUnitId,
      vendorId: null,
      description: ""
    };
  },
  watch: {
    posId(value) {
      if (value) {
        this.fetchUnitsData();
      }
    }
  },
  computed: {
    isNew() {
      return this.maintenanceId === "new";
    },
    serviceData() {
      return {
        unit_id: this.unitId,
        vendor_id: this.vendorId,
        description: this.description,
        media: this.images
      };
    },
    imageList() {
      return this.images.map(e => ({
        title: e.title,
        path: e.path
      }));
    }
  },
  mounted() {
    this.fetchData();
    if (this.posId) {
      this.fetchUnitsData();
    }
  },
  methods: {
    onAddAnother() {
      this.description = "";
      this.images = [];
      this.vendorId = null;
      this.unitId = null;
      this.created = false;
      this.maintenanceId = "new";
    },
    onSubmit() {
      this.handleCreate(
        createMaintenance(this.serviceData),
        "Maintenance"
      ).then(data => {
        this.created = true;
        this.maintenanceId = data.id;
        this.$emit("exit");
      });
    },
    fetchUnitsData() {
      this.handleFetch(getUnitsOfPos(this.posId)).then(data => {
        this.unitItems = [
          { value: null, text: "Please choose a unit." },
          ...data.map(e => ({
            value: e.id,
            text: e.title
          }))
        ];
      });
    },
    fetchData() {
      this.handleFetch(
        Promise.all([
          getVendorsOfCompany(this.companyId),
          this.getPos(true),
          this.isNew ? null : getMaintenance(this.maintenanceId)
        ])
      ).then(([vendorsData, posData, serviceData]) => {
        this.vendorItems = [
          { value: null, text: "Please select the company" },
          ...vendorsData.map(e => ({
            value: e.id,
            text: e.name
          }))
        ];
        this.posItems = [
          { value: null, text: "Please select the point of sale" },
          ...posData.map(e => ({
            value: e.id,
            text: e.name
          }))
        ];
        if (!this.isNew) {
          this.description = serviceData.description;
          this.unitId = serviceData.unit_id;
          this.posId = serviceData.unit && serviceData.unit.point_of_sale_id;
          this.vendorId = serviceData.vendor_id;
          this.images = serviceData.media;
        }
      });
    },
    onDeleteImage(index) {
      this.images.splice(index, 1);
    },
    onFileUploaded(e, response) {
      this.images.push({ path: response.message, title: e.name });
    }
  }
};
</script>
<style lang="scss">
.mo-edit-maintenance-modal {
  form {
    max-width: unset !important;
  }
}
</style>
