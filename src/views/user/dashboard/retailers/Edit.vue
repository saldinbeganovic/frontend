<template>
  <validation-observer class="h-100 flex-grow-1" v-slot="{ handleSubmit }">
    <mo-prompt-modal
      modal-id="delete-retailer-modal"
      message="Are you sure you want to delete this Retailer ?"
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
            @click="$bvModal.show('delete-retailer-modal')"
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
  getRetailer,
  createRetailer,
  deleteRetailer,
  updateRetailer
} from "@/api/user/retailer";

export default {
  name: "EditRetailer",
  props: {
    retailerId: {
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
      return this.retailerId === "new";
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
      this.handleCreate(createRetailer(this.retailerData), "Retailer").then(
        () => {
          this.$emit("end");
        }
      );
    },
    onUpdate() {
      this.handleUpdate(
        updateRetailer(this.retailerId, this.retailerData),
        "Retailer"
      ).then(() => {
        this.$emit("end", true);
      });
    },
    onDelete() {
      this.handleDelete(deleteRetailer(this.retailerId), "Retailer").then(
        () => {
          this.$emit("end");
        }
      );
    },
    fetchData() {
      if (!this.isNew) {
        getRetailer(this.retailerId).then(data => {
          this.name = data.name;
        });
      }
    }
  }
};
</script>
