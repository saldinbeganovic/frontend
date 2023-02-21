<template>
  <validation-observer class="h-100 flex-grow-1" v-slot="{ handleSubmit }">
    <form
      class="d-flex flex-column justify-content-between h-100"
      @submit.prevent="handleSubmit(onSubmit)"
    >
      <mo-dashboard-body :loading="isLoading">
        <template #body>
          <mo-prompt-modal
            modal-id="delete-vendor-modal"
            message="Do you want to delete this company ?"
            @right="onDelete"
          />
          <b-col>
            <b-row>
              <b-col>
                <b-form-group
                  class="w-100"
                  label="Company name"
                  label-for="companyName"
                >
                  <b-form-input
                    id="companyName"
                    v-model="companyName"
                    class="mo-input__light-sm"
                    placeholder="Company name"
                    type="text"
                    required
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group
                  class="w-100"
                  label="Company website"
                  label-for="companyWebsite"
                >
                  <b-form-input
                    id="companyWebsite"
                    v-model="companyWebsite"
                    class="mo-input__light-sm"
                    placeholder="Company website"
                    type="url"
                    @blur="onFormatUrl($event, 'companyWebsite')"
                  ></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-form-group
                  class="w-100"
                  label="Company phone number *"
                  label-for="phoneNumber1"
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
                    v-model="phoneNumber1"
                    required
                  />
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group
                  class="w-100"
                  label="Contact email"
                  label-for="contactEmail"
                >
                  <b-form-input
                    id="contactEmail"
                    v-model="contactEmail"
                    class="mo-input__light-sm"
                    placeholder="Contact email"
                    type="email"
                    required
                  ></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-form-group
                  class="w-100"
                  label="First name person"
                  :label-for="`firstName_0`"
                >
                  <b-form-input
                    :id="`firstName_0`"
                    v-model="contactPeople[0].firstName"
                    class="mo-input__light-sm"
                    placeholder="First name"
                    type="text"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group
                  class="w-100"
                  label="Last name"
                  :label-for="`lastName_0`"
                >
                  <b-form-input
                    :id="`lastName_0`"
                    v-model="contactPeople[0].lastName"
                    class="mo-input__light-sm"
                    placeholder="Last name"
                    type="text"
                  ></b-form-input>
                </b-form-group>
              </b-col>

              <b-col>
                <b-form-group
                  class="w-100"
                  label="Work position"
                  :label-for="`workPosition_0`"
                >
                  <b-form-input
                    :id="`workPosition_0`"
                    v-model="contactPeople[0].position"
                    class="mo-input__light-sm"
                    placeholder="Work position"
                    type="text"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col cols="4">
                <b-form-group
                  class="w-100"
                  label="Phone number"
                  :label-for="`phone_0`"
                >
                  <vue-phone-number-input
                    @update="
                      contactPeople[0].formattedPhone =
                        $event.formatInternational
                    "
                    :default-country-code="contactPeople[0].defaultCountryCode"
                    class="mo-input__light-sm-phone"
                    error-color="#FF3C30"
                    valid-color="#00E995"
                    color="#00A1FF"
                    :no-flags="true"
                    v-model="contactPeople[0].phone"
                  />
                </b-form-group>
              </b-col>
            </b-row>
          </b-col>
        </template>
        <template #footer-left>
          <mo-button
            v-if="!isNew && $store.getters.hasAdminRole"
            title="Delete"
            variant="danger"
            @click="$bvModal.show('delete-vendor-modal')"
          />
        </template>
        <template #footer-right>
          <mo-button
            v-if="isNew"
            type="submit"
            title="Create"
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
  createVendor,
  deleteVendor,
  getVendor,
  updateVendor
} from "@/api/user/vendor";
import { getAuthUser } from "@/api/authentication";
import parsePhoneNumber from "libphonenumber-js";

export default {
  name: "EditVendor",
  props: {
    vendorId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      currentUser: null,
      companyItems: [],
      companyName: "",
      companyWebsite: "",
      contactEmail: "",
      formattedFirstPhoneNumber: "",
      defaultFirstCountryCode: "",
      phoneNumber1: "",
      formattedSecondPhoneNumber: "",
      defaultSecondCountryCode: "",
      phoneNumber2: "",
      contactPeople: [
        {
          firstName: "",
          lastName: "",
          phone: "",
          position: ""
        },
        {
          firstName: "",
          lastName: "",
          phone: "",
          position: ""
        }
      ]
    };
  },
  computed: {
    companyId() {
      return this.$store.getters.companyId;
    },
    isNew() {
      return this.vendorId === "new";
    },
    vendorData() {
      return {
        name: this.companyName,
        email: this.contactEmail,
        phone1: this.formattedFirstPhoneNumber,
        phone2: this.formattedSecondPhoneNumber,
        website: this.companyWebsite,
        company_id: this.companyId,
        contact_people: this.contactPeople.map(e => ({
          first_name: e.firstName,
          last_name: e.lastName,
          phone: e.formattedPhone,
          position: e.position
        }))
      };
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onRemoveContact(index) {
      this.contactPeople.splice(index, 1);
    },
    onAddContact() {
      this.contactPeople.push({
        firstName: "",
        lastName: "",
        phone: "",
        position: ""
      });
    },
    onSubmit() {
      if (this.isNew) {
        this.onSave();
      } else {
        this.onUpdate();
      }
    },
    onSave() {
      this.handleCreate(createVendor(this.vendorData), "Vendor").then(() => {
        this.$emit("end");
      });
    },
    onUpdate() {
      this.handleUpdate(
        updateVendor(this.vendorId, this.vendorData),
        "Vendor"
      ).then(() => {
        this.$emit("end", true);
      });
    },
    onDelete() {
      this.handleDelete(deleteVendor(this.vendorId), "Vendor").then(() => {
        this.$bvModal.hide("delete-vendor-modal");
        this.$emit("end");
      });
    },
    fetchData() {
      this.handleFetch(
        Promise.all([
          getAuthUser(),
          this.isNew ? null : getVendor(this.vendorId)
        ])
      ).then(([user, vendor]) => {
        this.currentUser = user;
        if (!this.isNew) {
          this.companyName = vendor.name;
          this.contactEmail = vendor.email;
          const parsedPhone1 = vendor.phone1
            ? parsePhoneNumber(vendor.phone1, "SI")
            : {};
          this.defaultFirstCountryCode = parsedPhone1.country;
          this.phoneNumber1 = parsedPhone1.nationalNumber;
          this.formattedFirstPhoneNumber = vendor.phone2;
          const parsedPhone2 = vendor.phone2
            ? parsePhoneNumber(vendor.phone2, "SI")
            : {};
          this.defaultSecondCountryCode = parsedPhone2.country;
          this.phoneNumber2 = parsedPhone2.nationalNumber;
          this.formattedSecondPhoneNumber = vendor.phone2;
          this.companyWebsite = vendor.website;
          vendor.contact_people.forEach((e, i) => {
            const parsedPhone = e.phone ? parsePhoneNumber(e.phone, "SI") : {};
            this.contactPeople[i] = {
              firstName: e.first_name,
              lastName: e.last_name,
              formattedPhone: e.phone,
              phone: parsedPhone.nationalNumber,
              defaultCountryCode: parsedPhone.country,
              position: e.position
            };
          });
        }
      });
    }
  }
};
</script>
