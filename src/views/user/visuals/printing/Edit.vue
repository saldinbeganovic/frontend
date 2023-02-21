<template>
  <validation-observer class="h-100 flex-grow-1" v-slot="{ handleSubmit }">
    <mo-prompt-modal
      modal-id="delete-printing-modal"
      message="Are you sure you want to delete this Printing house ?"
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
              <b-col cols="4">
                <b-form-group
                  class="w-100"
                  label="Company name"
                  label-for="companyName"
                >
                  <b-form-input
                    id="companyName"
                    class="mo-input__light-sm"
                    v-model="companyName"
                    placeholder="Enter name..."
                    required
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col cols="4">
                <b-form-group class="w-100" label="Website" label-for="website">
                  <b-form-input
                    id="website"
                    class="mo-input__light-sm"
                    v-model="website"
                    placeholder="Enter url..."
                    type="url"
                    @blur="onFormatUrl($event, 'website')"
                  ></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="4">
                <b-form-group
                  class="w-100"
                  label="Contact person 1"
                  label-for="contactPerson"
                >
                  <b-form-input
                    id="contactPerson"
                    class="mo-input__light-sm"
                    v-model="firstContactPerson"
                    placeholder="Enter person name..."
                    required
                    type="text"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col cols="4">
                <b-form-group class="w-100" label="Email" label-for="email1">
                  <b-form-input
                    id="email1"
                    class="mo-input__light-sm"
                    v-model="firstEmail"
                    placeholder="Enter email..."
                    type="email"
                    required
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col cols="4">
                <b-form-group
                  class="w-100"
                  label="Phone number"
                  label-for="phone-number"
                >
                  <vue-phone-number-input
                    @update="
                      formattedFirstPhoneNumber = $event.formatInternational
                    "
                    :default-country-code="defaultFirstCountryCode"
                    class="mo-input__light-sm-phone"
                    error-color="#FF3C30"
                    valid-color="#00E995"
                    color="#00A1FF"
                    :no-flags="true"
                    v-model="firstPhoneNumber"
                  />
                </b-form-group>
              </b-col>
            </b-row>
          </b-col>
        </template>
        <template #footer-left>
          <mo-button
            v-if="!isNew && $store.getters.hasAdminRole"
            @click="$bvModal.show('delete-printing-modal')"
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
  createPrintingHouse,
  deletePrintingHouse,
  getPrintingHouse,
  updatePrintingHouse
} from "@/api/user/campaigns/printing-houses";
import parsePhoneNumber from "libphonenumber-js";

export default {
  name: "EditPrintingHouse",
  props: {
    printingHouseId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      companyName: "",
      firstEmail: "",
      formattedFirstPhoneNumber: "",
      defaultFirstCountryCode: "",
      firstPhoneNumber: "",
      website: ""
    };
  },
  computed: {
    isNew() {
      return this.printingHouseId === "new";
    },
    headerTitle() {
      return this.isNew ? `Add printing house` : `Edit printing house`;
    },
    printingHouseData() {
      return {
        name: this.companyName,
        email: this.firstEmail,
        phone: this.formattedFirstPhoneNumber,
        contact_person: this.firstContactPerson,
        website: this.website,
        company_id: this.$store.getters.companyId
      };
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
      this.handleCreate(
        createPrintingHouse(this.printingHouseData),
        "Printing House"
      ).then(() => {
        this.$emit("end");
      });
    },
    onUpdate() {
      this.handleUpdate(
        updatePrintingHouse(this.printingHouseId, this.printingHouseData),
        "Printing house"
      ).then(() => {
        this.$emit("end", true);
      });
    },
    onDelete() {
      this.handleDelete(
        deletePrintingHouse(this.printingHouseId),
        "Printing house"
      ).then(() => {
        this.$emit("end");
      });
    },
    fetchData() {
      if (!this.isNew) {
        this.handleFetch(getPrintingHouse(this.printingHouseId)).then(data => {
          this.firstEmail = data.email;

          const parsedPhone1 = data.phone
            ? parsePhoneNumber(data.phone, "SI")
            : {};

          this.defaultFirstCountryCode = parsedPhone1.country;
          this.firstPhoneNumber = parsedPhone1.nationalNumber;
          this.formattedFirstPhoneNumber = data.phone;
          this.firstContactPerson = data.contact_person;
          this.companyName = data.name;
          this.website = data.website;
        });
      }
    }
  }
};
</script>
