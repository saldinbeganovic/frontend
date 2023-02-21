<template>
  <form @submit.prevent="onSubmit" class="h-100 w-100">
    <mo-dashboard-body :loading="isLoading">
      <template #body>
        <mo-prompt-modal
          modal-id="delete-visual-material-modal"
          message="Are you sure you want to delete this visual material ?"
          @right="onDelete"
        />
        <b-col class="h-100">
          <b-row>
            <b-col>
              <b-form-group class="w-100" label="Name" label-for="name">
                <b-form-input
                  id="name"
                  v-model="name"
                  class="mo-input__light-sm"
                  placeholder="Name"
                  type="text"
                  required
                ></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-group class="w-100" label="Notes" label-for="notes">
                <b-form-textarea
                  id="notes"
                  v-model="notes"
                  class="mo-input__light-sm"
                  placeholder="Notes"
                  type="text"
                  rows="2"
                >
                </b-form-textarea>
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>
      </template>
      <template #footer-left v-if="$store.getters.hasAdminRole">
        <mo-button
          v-if="!isNew"
          @click="$bvModal.show('delete-visual-material-modal')"
          title="Delete"
          variant="danger"
        />
      </template>
      <template #footer-right>
        <mo-button
          type="submit"
          title="Save"
          :loading="isSubmitting"
          v-if="$store.getters.hasAdminRole"
        />
      </template>
    </mo-dashboard-body>
  </form>
</template>

<script>
import {
  getVisualMaterial,
  createVisualMaterial,
  updateVisualMaterial,
  deleteVisualMaterial
} from "@/api/user/campaigns/visual-materials";

export default {
  name: "editVisualMaterial",
  data() {
    return {
      name: "",
      notes: "",
      isSubmitting: false,
      isLoading: false
    };
  },
  props: {
    visualMaterialId: {
      required: true
    }
  },
  computed: {
    isNew() {
      return this.visualMaterialId === "new";
    },
    visualMateriaRequestData() {
      return {
        name: this.name,
        notes: this.notes,
        company_id: this.$store.getters.companyId
      };
    }
  },
  created() {
    this.fetchData();
  },
  mounted() {},
  methods: {
    onSubmit() {
      this.isSubmitting = true;
      if (this.isNew) {
        this.onCreate();
      } else {
        this.onUpdate();
      }
    },
    onCreate() {
      this.handleCreate(
        createVisualMaterial(this.visualMateriaRequestData),
        "Visual material"
      ).then(data => {
        this.visualMaterialId = data.id;
        this.$emit("fetch");
      });
    },
    onUpdate() {
      this.handleUpdate(
        updateVisualMaterial(
          this.visualMaterialId,
          this.visualMateriaRequestData
        ),
        "Visual material"
      ).then(() => {
        this.$emit("fetch");
      });
    },
    onDelete() {
      this.handleDelete(deleteVisualMaterial(this.visualMaterialId)).then(
        () => {
          this.$emit("delete");
        }
      );
    },
    fetchData() {
      if (!this.isNew) {
        this.handleFetch(getVisualMaterial(this.visualMaterialId)).then(
          data => {
            this.name = data.name;
            this.notes = data.notes;
          }
        );
      }
    }
  }
};
</script>
