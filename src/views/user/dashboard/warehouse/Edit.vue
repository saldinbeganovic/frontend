<template>
  <validation-observer class="h-100 flex-grow-1" v-slot="{ handleSubmit }">
    <mo-prompt-modal
      modal-id="delete-retailer-modal"
      message="Are you sure you want to delete this Warehouse ?"
      @right="onDelete"
    />
    <form
      class="d-flex flex-column justify-content-between h-100"
      @submit.prevent="handleSubmit(onSubmit)"
    >
      <mo-dashboard-body :loading="isLoading">
        <template #body>
          <b-col class="mx-4">
            <b-row>
              <b-col>
                <b-form-group class="w-100" label="Name" label-for="name">
                  <b-form-input
                    id="name"
                    class="mo-input__light-sm"
                    v-model="name"
                    placeholder="Enter name..."
                    required
                    type="text"
                  ></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>
          </b-col>
        </template>
        <template #footer-left>
          <mo-button
            v-if="showDeleteButton && $store.getters.hasAdminRole"
            @click="$bvModal.show('delete-retailer-modal')"
            title="Delete"
            variant="danger"
          />
        </template>
        <template #footer-right v-if="$store.getters.hasAdminRole">
          <mo-button
            v-if="isNew"
            type="submit"
            title="Save"
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
  </validation-observer>
</template>

<script>
import {
  getWarehouse,
  createWarehouse,
  deleteWarehouse,
  updateWarehouse
} from "@/api/user/warehouse";

export default {
  name: "EditWarehouse",
  props: {
    warehouseId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      name: ""
    };
  },
  computed: {
    showDeleteButton() {
      return !this.isNew && this.$store.getters.hasAdminRole;
    },
    isNew() {
      return this.warehouseId === "new";
    },
    headerTitle() {
      return this.isNew ? `Add retailer` : `Edit retailer`;
    },
    retailerData() {
      return {
        name: this.name,
        company_id: this.companyId
      };
    }
  },
  watch: {
    name(value) {
      if (value.toUpperCase() !== value) {
        this.name = value.toUpperCase();
      }
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onSubmit() {
      if (this.isNew) {
        this.onCreate();
      } else {
        this.onUpdate();
      }
    },
    onCreate() {
      this.handleCreate(createWarehouse(this.retailerData), "Warehouse").then(
        () => {
          this.$emit("end");
        }
      );
    },
    onUpdate() {
      this.handleUpdate(
        updateWarehouse(this.warehouseId, this.retailerData),
        "Warehouse"
      ).then(() => {
        this.$emit("end", true);
      });
    },
    onDelete() {
      this.handleDelete(deleteWarehouse(this.warehouseId), "Warehouse").then(
        () => {
          this.$emit("end");
        }
      );
    },
    fetchData() {
      if (!this.isNew) {
        getWarehouse(this.warehouseId).then(data => {
          this.name = data.name;
        });
      }
    }
  }
};
</script>
