<template>
  <mo-dashboard title="Edit batch" @search="searchQuery = $event">
    <template #body>
      <form
        class="d-flex flex-column justify-content-between h-100 w-100 mo-manufacturer-unit-edit"
        @submit.prevent="onSubmit"
      >
        <mo-dashboard-body :loading="isLoading">
          <template #body>
            <mo-prompt-modal
              modal-id="delete-batch-modal"
              message="Delete this batch ?"
              description="Are you sure you would like to delete this batch of units ? This action cannot be undone."
              @left="$bvModal.hide('delete-batch-modal')"
              @right="onDelete"
            />
            <mo-prompt-modal
              modal-id="batch-activation-modal"
              message="Batch activation"
              description="This activation code should be sent to the client. Once the client confirms & imports the batch no data can be edited. Please make sure all the data is correct."
              left-option="Cancel"
              right-option="Ok, copy"
              right-option-variant=""
              @left="$bvModal.hide('batch-activation-modal')"
              @right="onCopyActivationCode"
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
                      :disabled="disabled"
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
                      :disabled="disabled"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col v-if="activationCode">
                  <b-form-group
                    class="w-100"
                    label="Activation code"
                    label-for="activationCode"
                  >
                    <b-form-input
                      id="activationCode"
                      v-model="activationCode"
                      class="mo-input__light-sm"
                      placeholder="Activation code"
                      type="text"
                      disabled
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
                  Units <small>{{ selectedText }}</small>
                </h4>
              </b-row>
              <b-row>
                <mo-table
                  empty-text="No units to show"
                  :search-query="searchQuery"
                  :items="units"
                  :fields="fields"
                  :loading="isLoading"
                  :initial-selected="initialSelected"
                  :show-select-all="!disabled"
                  @select="selected = $event"
                  @edit="onEditUnit"
                >
                  <template #cell(cover_photo)="{item}">
                    <img v-if="item.image" :src="getImageUrl(item.image)" />
                    <i v-else class="fa fa-store mo-company-icon" />
                  </template>
                </mo-table>
              </b-row>
            </b-col>
          </template>
          <template v-if="!disabled" #footer-left>
            <mo-button
              title="Delete"
              variant="danger"
              @click="$bvModal.show('delete-batch-modal')"
            />
          </template>
          <template v-if="!disabled" #footer-right>
            <mo-button
              v-if="activationCode"
              title="Copy activation code"
              class="mr-2"
              outline
              @click="$bvModal.show('batch-activation-modal')"
            />
            <mo-button
              v-if="isNew"
              type="submit"
              title="Create"
              :loading="isSubmitting"
            />
            <mo-button
              v-else
              type="submit"
              title="Update"
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
  createManufacturerBatch,
  deleteManufacturerBatch,
  getManufacturerUnits,
  updateManufacturerBatch
} from "@/api/manufacturer";
import { getBatch } from "@/api/admin/company/unit/unit";

export default {
  name: "EditBatch",
  data() {
    return {
      name: "",
      note: "",
      isLoading: true,
      isSubmitting: false,
      searchQuery: "",
      activationCode: null,
      disabled: false,
      selected: [],
      initialSelected: {},
      units: [],
      fields: [
        { key: "cover_photo", label: "Image" },
        { key: "title", label: "Name" },
        { key: "brand", label: "Brand" },
        { key: "options", label: "" }
      ]
    };
  },
  computed: {
    batchId() {
      return this.$route.params.batchId;
    },
    isNew() {
      return this.batchId === "new";
    },
    selectedText() {
      return this.selected.length > 0
        ? `(${this.selected.length} selected)`
        : "";
    },
    batchData() {
      return {
        name: this.name,
        notes: this.note,
        units: this.selected
      };
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onCopyActivationCode() {
      navigator.clipboard
        .writeText(this.activationCode)
        .then(() => {
          this.$bvToast.toast("Activation code was copied to your clipboard!");
        })
        .catch(e => {
          this.$bvToast.toast(
            `Error copying activation code to clipboard: ${e.message}`
          );
        });
    },
    onDelete() {
      this.handleDelete(deleteManufacturerBatch(this.batchId)).then(() =>
        this.$router.back()
      );
    },
    onSubmit() {
      if (this.isNew) {
        this.handleCreate(
          createManufacturerBatch(this.batchData),
          "Batch"
        ).then(() => this.$router.back());
      } else {
        this.handleUpdate(
          updateManufacturerBatch(this.batchId, this.batchData),
          "Batch"
        );
      }
    },
    fetchData() {
      if (this.isNew) {
        this.fields = [{ key: "select", label: "" }, ...this.fields];
        this.handleFetch(getManufacturerUnits("is_imported")).then(data => {
          this.units = data;
        });
      } else {
        this.handleFetch(getBatch(this.batchId)).then(data => {
          this.name = data.name;
          this.note = data.notes;
          this.activationCode = data.activation_code;
          this.disabled = !!data.is_activated;
          if (this.disabled) {
            this.units = data.units;
          } else {
            this.fields = [{ key: "select", label: "" }, ...this.fields];
            // if the edit is still allowed, show all units and only select the units already selected
            this.handleFetch(getManufacturerUnits("is_imported")).then(
              units => {
                this.units = units;
                this.initialSelected = data.units
                  .map(e => e.id)
                  .reduce((p, c) => Object.assign(p, { [c]: true }), {});
              }
            );
          }
        });
      }
    },
    onEditUnit(unitId) {
      this.$router.push(`/manufacturer/unit/${unitId}`);
    }
  }
};
</script>
