<template>
  <validation-observer class="h-100 flex-grow-1" v-slot="{ handleSubmit }">
    <mo-prompt-modal
      modal-id="delete-brand-modal"
      message="Are you sure you want to delete this Brand ?"
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
            v-if="!isNew && $store.getters.hasAdminRole"
            @click="$bvModal.show('delete-brand-modal')"
            title="Delete"
            variant="danger"
          />
        </template>
        <template #footer-right>
          <mo-button
            v-if="isNew && $store.getters.hasAdminRole"
            type="submit"
            title="Save"
            :loading="isSubmitting"
          />
          <mo-button
            v-else-if="$store.getters.hasAdminRole"
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
  createBrand,
  deleteBrand,
  getBrand,
  updateBrand
} from "@/api/user/brand";

export default {
  name: "EditBrand",
  props: {
    brandId: {
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
    isNew() {
      return this.brandId === "new";
    },
    headerTitle() {
      return this.isNew ? `Add brand` : `Edit brand`;
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
      this.handleCreate(createBrand(this.retailerData), "Brand").then(() => {
        this.$emit("end");
      });
    },
    onUpdate() {
      this.handleUpdate(
        updateBrand(this.brandId, this.retailerData),
        "Brand"
      ).then(() => {
        this.$emit("end", true);
      });
    },
    onDelete() {
      this.handleDelete(deleteBrand(this.brandId), "Brand").then(() => {
        this.$emit("end");
      });
    },
    fetchData() {
      if (!this.isNew) {
        getBrand(this.brandId).then(data => {
          this.name = data.name;
        });
      }
    }
  }
};
</script>
