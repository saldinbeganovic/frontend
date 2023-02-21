<template>
  <validation-observer class="h-100 w-100" v-slot="{ handleSubmit }">
    <mo-prompt-modal
      modal-id="delete-modal"
      message="Are you sure you want to delete this group ?"
      @right="onDelete"
    />
    <mo-prompt-modal
      modal-id="block-modal"
      message="Are you sure you want to block this group ?"
      @right="onBlock"
    />
    <mo-prompt-modal
      modal-id="unblock-modal"
      message="Are you sure you want to unblock this group ?"
      @right="onUnblock"
    />
    <mo-file-modal
      modal-id="upload-pic-modal"
      api-endpoint="/api/companies/upload"
      @success="onFileUploaded"
    />
    <form
      class="d-flex flex-column justify-content-between h-100"
      @submit.prevent="handleSubmit(onSubmit)"
    >
      <mo-dashboard-body :loading="isLoading">
        <template #body>
          <b-col class="mx-4">
            <b-row>
              <mo-image
                :image="logo"
                @edit="$bvModal.show('upload-pic-modal')"
              />
            </b-row>
            <b-row class="mt-3">
              <mo-status-badge
                :title="isBlocked ? 'Blocked' : 'Active'"
                :variant="isBlocked ? 'danger' : 'success'"
                :clickable="false"
              />
            </b-row>
            <b-row class="mt-3">
              <b-form-group class="w-100" label="Country" label-for="country">
                <b-form-select
                  id="country"
                  v-model="country"
                  class="mo-input__light-sm"
                  :options="countries"
                  required
                ></b-form-select>
              </b-form-group>
            </b-row>
          </b-col>
          <b-col class="mx-4">
            <b-row>
              <b-form-group
                class="w-100"
                label="Group name"
                label-for="company-name"
              >
                <b-form-input
                  id="company-name"
                  v-model="name"
                  class="mo-input__light-sm"
                  placeholder="Group name"
                  type="text"
                  required
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <validation-provider
                name="phone-number"
                rules="phone-number"
                class="w-100"
                v-slot="{ errors, valid }"
              >
                <b-form-group
                  :invalid-feedback="errors[0]"
                  :state="valid"
                  label="Phone number"
                  label-for="company-number"
                >
                  <vue-phone-number-input
                    @update="formattedPhoneNumber = $event.formatInternational"
                    :default-country-code="defaultCountryCode"
                    class="mo-input__light-sm-phone"
                    v-model="phoneNumber"
                    :no-flags="true"
                  />
                </b-form-group>
              </validation-provider>
            </b-row>
            <b-row>
              <validation-provider
                name="email"
                class="w-100"
                rules="email"
                v-slot="{ errors, valid }"
              >
                <b-form-group
                  :invalid-feedback="errors[0]"
                  :state="valid"
                  label="Email"
                  label-for="email"
                >
                  <b-form-input
                    id="email"
                    v-model="email"
                    class="mo-input__light-sm"
                    placeholder="Email"
                    type="email"
                    required
                  ></b-form-input>
                </b-form-group>
              </validation-provider>
            </b-row>
            <b-row>
              <b-form-group class="w-100" label="Address" label-for="address">
                <b-form-input
                  id="address"
                  v-model="address"
                  class="mo-input__light-sm"
                  placeholder="Address"
                  type="text"
                  required
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <b-form-group class="w-100" label="City" label-for="city">
                <b-form-input
                  id="city"
                  v-model="city"
                  class="mo-input__light-sm"
                  placeholder="City"
                  type="text"
                  required
                ></b-form-input>
              </b-form-group>
            </b-row>
          </b-col>
          <b-col class="mx-4">
            <b-row>
              <b-form-group class="w-100" label="Brand" label-for="brand">
                <b-form-input
                  id="brand"
                  v-model="brand"
                  class="mo-input__light-sm"
                  placeholder="Brand"
                  type="text"
                  required
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <validation-provider
                name="website"
                class="w-100"
                rules="website"
                v-slot="{ errors, valid }"
              >
                <b-form-group
                  :invalid-feedback="errors[0]"
                  :state="valid"
                  label="Website"
                  label-for="website"
                >
                  <b-form-input
                    id="website"
                    v-model="website"
                    class="mo-input__light-sm"
                    placeholder="Website"
                    type="url"
                    required
                    @blur="onFormatUrl($event, 'website')"
                  ></b-form-input>
                </b-form-group>
              </validation-provider>
            </b-row>
            <b-row>
              <b-form-group
                class="w-100"
                label="Tax number"
                label-for="tax-number"
              >
                <b-form-input
                  id="tax-number"
                  v-model="taxNumber"
                  class="mo-input__light-sm"
                  placeholder="Tax number"
                  type="number"
                  required
                ></b-form-input>
              </b-form-group>
              <b-form-group label="Viable for TAX">
                <b-form-radio v-model="taxLiability" :value="true">
                  Yes
                </b-form-radio>
                <b-form-radio v-model="taxLiability" :value="false">
                  No
                </b-form-radio>
              </b-form-group>
            </b-row>
            <b-row>
              <b-form-group
                class="w-100"
                label="Postal code"
                label-for="postal-code"
              >
                <b-form-input
                  id="postal-code"
                  v-model="postalCode"
                  class="mo-input__light-sm"
                  placeholder="Postal code"
                  type="number"
                  required
                ></b-form-input>
              </b-form-group>
            </b-row>
          </b-col>
        </template>
        <template #footer-left>
          <template v-if="!isNew">
            <mo-button
              class="mr-2"
              title="Delete"
              variant="danger"
              @click="$bvModal.show('delete-modal')"
            />
            <mo-button
              v-if="isBlocked"
              title="Unblock"
              @click="$bvModal.show('unblock-modal')"
            />
            <mo-button
              v-else
              title="Block"
              @click="$bvModal.show('block-modal')"
            />
          </template>
        </template>
        <template #footer-right>
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
  </validation-observer>
</template>

<script>
import {
  blockCompany,
  createCompany,
  deleteCompany,
  getCompany,
  getCompanyMetadata,
  unblockCompany,
  updateCompany
} from "@/api/admin/company/company";
import parsePhoneNumber from "libphonenumber-js";

export default {
  name: "Overview",
  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      isDeleting: false,
      isBlocking: false,
      isBlocked: null,
      country: null,
      logo: null,
      city: "",
      name: "",
      formattedPhoneNumber: "",
      defaultCountryCode: "",
      phoneNumber: "",
      email: "",
      address: "",
      brand: "",
      website: "",
      taxNumber: "",
      postalCode: "",
      taxLiability: false,
      countries: []
    };
  },
  computed: {
    isNew() {
      return this.companyId === "new";
    },
    companyData() {
      return {
        logo: this.logo,
        name: this.name,
        postal_code: this.postalCode,
        brand: this.brand,
        city: this.city,
        phone: this.formattedPhoneNumber,
        address: this.address,
        website: this.website,
        country_id: this.country,
        email: this.email,
        tax_number: this.taxNumber,
        tax_liability: this.taxLiability
      };
    }
  },
  mounted() {
    this.handleFetch(
      Promise.all([
        !this.isNew ? getCompany(this.companyId) : null,
        getCompanyMetadata()
      ])
    ).then(([data, metadata]) => {
      if (!this.isNew) {
        this.address = data.address;
        this.brand = data.brand;
        const parsedPhone = data.phone
          ? parsePhoneNumber(data.phone, "SI")
          : {};
        this.defaultCountryCode = parsedPhone.country;
        this.phoneNumber = parsedPhone.nationalNumber;
        this.formattedPhoneNumber = data.phone;
        this.website = data.website;
        this.name = data.name;
        this.city = data.city;
        this.email = data.email;
        this.isBlocked = !!data.is_blocked;
        this.taxNumber = data.tax_number;
        this.postalCode = data.postal_code;
        this.taxLiability = Boolean(data.tax_liability);
        this.country = data.country_id;
        this.logo = data.logo;
      }
      this.countries = [
        { value: null, text: "Please select a country" },
        ...metadata.countries.map(e => ({
          value: e.id,
          text: e.name
        }))
      ];
    });
  },
  methods: {
    onFileUploaded(e, response) {
      this.logo = response.message;
    },
    onSubmit() {
      if (this.isNew) {
        this.onCreate();
      } else {
        this.onUpdate();
      }
    },
    onCreate() {
      this.isSubmitting = true;
      this.handleCreate(
        createCompany(this.companyData).then(() => {
          this.$router.back();
        }),
        "Companies"
      );
    },
    onDelete() {
      this.handleDelete(deleteCompany(this.companyId), "Company").then(() => {
        this.$router.back();
      });
    },
    onUpdate() {
      this.handleUpdate(
        updateCompany(this.companyId, this.companyData),
        "Company"
      );
    },
    onBlock() {
      this.handleBlock(blockCompany(this.companyId)).then(() => {
        this.$router.back();
      });
    },
    onUnblock() {
      this.handleUnblock(unblockCompany(this.companyId), "Company").then(() => {
        this.$router.back();
      });
    }
  }
};
</script>
