<template>
  <mo-dashboard title="Edit PoS" @search="searchQuery = $event">
    <template #body>
      <validation-observer class="h-100 w-100" v-slot="{ handleSubmit }">
        <mo-screen-wrapper-modal
          ref="editUnitModal"
          dialog-class="mo-edit-unit-modal__dialog"
          #body="{props}"
        >
          <edit-unit
            :unit-id="props.unitId"
            :pos-id="props.posId"
            :duplicate-unit-id="props.duplicateUnitId"
            @create="onUnitCreate"
            @update="onUnitUpdate"
          />
        </mo-screen-wrapper-modal>
        <b-modal
      :id="modalIdName"
      hide-footer
      hide-header
      size="sm"
      centered
      body-class="mo-input-modal-body"
      dialog-class="mo-player__modal"
    >
      <h3 class="text-center font-weight-light mb-5">
        Add a new album
      </h3>
      <b-form class="mo-player__form" @submit.prevent="onSubmitAlbum">
        <b-form-group label="Enter album name" label-for="name-input">
          <b-form-input v-model="albumName" placeholder="" ></b-form-input> 
        </b-form-group>
        <b-button type="submit" class="mo-btn mt-4 sbmtBtn">Submit</b-button>
      </b-form>
      
      
    </b-modal>
        <mo-screen-wrapper-modal ref="editMaintenanceModal" #body="{props}">
          <mo-edit-maintenance-modal
            :initial-pos-id="props.maintenancePosId"
            :initial-unit-id="props.maintenanceUnitId"
            :maintenance-id="props.maintenanceId"
          />
        </mo-screen-wrapper-modal>
        <mo-prompt-modal
          modal-id="delete-pos-modal"
          message="Are you sure you want to delete this point of sale ?"
          @right="onDelete"
        />
        <mo-prompt-modal
          modal-id="delete-pos-image-modal"
          message="Are you sure you want to delete this image ?"
          @right="onDeleteImage"
        />
        <mo-prompt-modal
          modal-id="delete-modem-modal"
          message="Are you sure you want to remove this modem from PoS ?"
          @right="onDeleteModem"
        />
        <mo-file-modal
          modal-id="upload-pic-modal"
          api-endpoint="/api/point-of-sale/upload"
          @success-path="onCoverPhotoUpload"
        />
        <mo-add-modem-modal
          modal-id="activate-modem-modal"
          @submit="onActivateModem"
        />
        <mo-file-modal
          modal-id="upload-pos-image-modal"
          api-endpoint="/api/point-of-sale/upload"
          :body-fields="[{ key: 'type', value: 'images' }]"
          @success-path="onUploadImageSuccess"
        />
        <mo-image-gallery
          modal-id="cover-image-modal"
          :images="[{ path: image }]"
        />

        <form
          class="d-flex flex-column justify-content-between h-100 mo-pos-edit"
          @submit.prevent="handleSubmit(onSubmit)"
        >
          <mo-dashboard-body
            aligned-class="mo-pos-edit__aligned"
            :loading="isLoading"
          >
            <template #body>
              <b-col>
                <b-row>
                  <h4>{{ generalTitle }}</h4>
                </b-row>
                <b-row>
                  <b-col class="mr-1" cols="2">
                    <b-row>
                      <mo-image-select
                        request-prefix="pos"
                        :main-image="image"
                        :images="photosN"
                        :disabled="!$store.getters.hasAdminRole"
                        :show-delete="
                          $store.getters.hasAdminRole ? true : false
                        "
                        @image-selected="changeCoverPhoto"
                        @edit-image="$bvModal.show('upload-pic-modal')"
                        @delete-image="$bvModal.show('delete-pos-image-modal')"
                        @expand-image="$bvModal.show('cover-image-modal')"
                      />
                    </b-row>
                  </b-col>
                  <b-col class="mx-1" cols="4">
                    <b-row>
                      <b-col class="px-1">
                        <b-form-group
                          class="w-100"
                          label="POS name"
                          label-for="pos-name"
                        >
                          <b-form-input
                            id="pos-name"
                            v-model="name"
                            class="mo-input__light-sm"
                            placeholder="Pos name"
                            type="text"
                            required
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                      <b-col class="px-1">
                        <b-form-group
                          class="w-100"
                          label="Brand"
                          label-for="brand"
                        >
                          <b-form-select
                            id="brand"
                            v-model="brandId"
                            :options="brands"
                            text-field="name"
                            value-field="id"
                            class="mo-input__light-sm"
                          ></b-form-select>
                        </b-form-group>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col class="px-1">
                        <b-form-group
                          class="w-100"
                          label="Retailer"
                          label-for="retailer"
                        >
                          <b-form-select
                            id="retailer"
                            v-model="retailerId"
                            :options="retailers"
                            text-field="name"
                            value-field="id"
                            class="mo-input__light-sm"
                          ></b-form-select>
                        </b-form-group>
                      </b-col>
                      <b-col class="px-1">
                        <b-form-group
                          class="w-100"
                          label="Country"
                          label-for="country"
                        >
                          <b-form-select
                            id="country"
                            name="country"
                            v-model="countryId"
                            class="mo-input__light-sm"
                            :options="countries"
                          ></b-form-select>
                        </b-form-group>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col class="px-1">
                        <b-form-group
                          class="w-100"
                          label="Manager (first name)"
                          label-for="manager-first-name"
                        >
                          <b-form-input
                            id="manager-first-name"
                            v-model="managerFirstName"
                            class="mo-input__light-sm"
                            placeholder="First name"
                            type="text"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                      <b-col class="px-1">
                        <b-form-group
                          class="w-100"
                          label="Manager (last name)"
                          label-for="manager-last-name"
                        >
                          <b-form-input
                            id="manager-last-name"
                            v-model="managerLastName"
                            class="mo-input__light-sm"
                            placeholder="Last name"
                            type="text"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col class="px-1">
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
                            ></b-form-input>
                          </b-form-group>
                        </validation-provider>
                      </b-col>
                      <b-col class="px-1" cols="6">
                        <b-form-group
                          class="w-100 mb-0"
                          label="Phone number"
                          label-for="phone-number"
                        >
                          <vue-phone-number-input
                            @update="
                              formattedPhoneNumber = $event.formatInternational
                            "
                            :default-country-code="defaultCountryCode"
                            class="mo-input__light-sm-phone"
                            error-color="#FF3C30"
                            valid-color="#00E995"
                            color="#00A1FF"
                            :no-flags="true"
                            :no-example="true"
                            v-model="phoneNumber"
                          />
                        </b-form-group>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col class="px-1">
                        <b-form-group
                          class="w-100"
                          label="Address"
                          label-for="address1"
                        >
                          <b-form-input
                            id="address1"
                            class="mo-input__light-sm"
                            v-model="address"
                            placeholder="Address"
                            type="text"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                      <b-col class="px-1">
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
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col class="px-1" cols="6">
                        <b-form-group
                          class="w-100"
                          label="City"
                          label-for="city"
                        >
                          <b-form-input
                            id="city"
                            v-model="city"
                            name="city"
                            class="mo-input__light-sm"
                            placeholder="City"
                            type="text"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                    </b-row>
                  </b-col>
                  <b-col v-if="!isNew">
                    <b-row>
                      <b-col class="mx-2">
                        <mo-collapse-section
                          :show-divider="false"
                          title="Modems"
                          :is-loading="isLoading"
                        >
                          <template #body>
                            <b-col>
                              <b-row>
                                <mo-pos-modems
                                  ref="modems"
                                  :search-query="searchQuery"
                                  @delete="onDeleteModemButtonClick"
                                />
                              </b-row>
                              <b-row>
                                <button
                                  class="mo-multiselect__add mt-3"
                                  v-if="canCreateModem"
                                  @click.prevent="
                                    $bvModal.show('activate-modem-modal')
                                  "
                                >
                                  <i class="fas fa-plus" />
                                  Activate new modem
                                </button>
                              </b-row>
                            </b-col>
                           
                          </template>
                        </mo-collapse-section>
                      </b-col>
                    </b-row>
                  </b-col></b-row
                >

                <template v-if="!isNew">
                  <b-row v-if="!isNew" >
                    

                    <b-col >
                      <mo-collapse-section
                        :show-divider="false"
                        ref="unitsSection"
                        title="Units"
                        :is-loading="isLoading"
                        class="mb-5"
                        style="    width: 105% !important;"
                      >
                        <template #body>
                          <b-col>
                            <b-row>
                              <mo-pos-units
                                ref="posUnits"
                                :search-query="searchQuery"
                                @edit="onEditUnit"
                                @fetched="$refs.unitsSection.refresh()"
                              />
                            </b-row>
                            <b-row>
                              <b-col>
                                <button
                                  class="mo-multiselect__add mt-3"
                                  v-if="canCreateUnit"
                                  @click.prevent="onAddNewUnit"
                                >
                                  <i class="fas fa-plus" />
                                  Add unit
                                </button>
                              </b-col>
                            </b-row>
                          </b-col>
                        </template>
                      </mo-collapse-section>
                    </b-col>
                    <b-col   >
                      <mo-collapse-section
                        :show-divider="false"
                        :is-loading="isLoading"
                        title="Albums"
                        style=" padding-right: 0px  !important;     padding-left: 40px;"
                      >
                        <template #body>
                         
                           
                          <b-col >
                            <b-row>
                              <mo-pos-images
                                ref="posImages"
                                :pos-id="posId"
                                :images="photos"
                                @deleted="deletePosAlbumImage"
                                @deletedalbum="deletePosAlbum"
                                @newimage="newimageAlbum"
                              />
                            </b-row>
                            <b-row>
                              <button
                                v-if="$store.getters.hasAdminRole"
                                class="mo-multiselect__add mt-3"
                                @click.prevent="onAddImage"
                              >
                                <i class="fas fa-plus" />
                                Add album
                              </button>
                              <span ></span>
                            </b-row>
                          </b-col>
                        </template>
                      </mo-collapse-section>
                    </b-col>
                  </b-row>
                </template>
                
              </b-col>
            </template>
            <template v-if="!isNew" #footer-left>
              <mo-button
                class="mr-2"
                title="Back"
                @click="goBackAndActivateTableFilters"
              />

              <mo-button
                v-if="$store.getters.hasAdminRole"
                variant="danger"
                class="mr-2 "
                title="Delete"
                @click="$bvModal.show('delete-pos-modal')"
              />
            </template>
            <template #footer-right>
              <mo-button
                v-if="!isNew && $store.getters.hasAdminRole"
                class="mr-2"
                title="Order maintenance"
                width="285px"
                @click="onOrderMaintenance"
              />
              <mo-button
                v-if="isNew && $store.getters.hasAdminRole"
                :loading="isSubmitting"
                title="Save"
                type="submit"
              />
              <mo-button
                v-else-if="$store.getters.hasAdminRole"
                :loading="isSubmitting"
                title="Update"
                type="submit"
              />
            </template>
          </mo-dashboard-body>
        </form>
      </validation-observer>
    </template>
  </mo-dashboard>
</template>

<script>
import {
  createPos,
  updatePos,
  getPos,
  deletePos,
  getPosMetadata,
} from "@/api/admin/company/point-of-sale";
import { getCompanyMetadata } from "@/api/admin/company/company";
import parsePhoneNumber from "libphonenumber-js";
import MoPosUnits from "@/components/statefull/tables/MoPosUnits";
import MoPosModems from "@/components/statefull/tables/MoPosModems";
import { activateModem, removeModemFromPos } from "@/api/admin/device/modem";
import MoAddModemModal from "@/components/pure/modals/MoAddModemModal";
import MoPosImages from "@/components/statefull/tables/MoPosImages";
import { createPosPhoto } from "@/api/admin/company/photos";
import MoImageSelect from "@/components/pure/MoImageSelect";
import MoEditMaintenanceModal from "@/views/user/maintenance/EditMaintenance";
import EditUnit from "@/views/shared/pos/EditUnit";
import MoImageGallery from "@/components/pure/modals/MoImageGallery";
//import { data } from "vue2-dropzone";

export default {
  name: "Overview",
  components: {
    EditUnit,
    MoEditMaintenanceModal,
    MoPosImages,
    MoAddModemModal,
    MoPosModems,
    MoPosUnits,
    MoImageGallery,
    MoImageSelect,
  },
  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      modalIdName: "album_name_modal",
      currentImage: {},
      albumName: "",
      newAlbumName: "",
      pos: {},
      image: "",
      name: "",
      address: "",
      postalCode: "",
      email: "",
      managerFirstName: "",
      managerLastName: "",
      countryId: null,
      city: "",
      formattedPhoneNumber: "",
      defaultCountryCode: "",
      phoneNumber: "",
      countries: [],
      activeModems: 0,
      inactiveModems: 0,
      activePlayers: 0,
      inactivePlayers: 0,
      photos: [],
      brands: [],
      photosN: [],
      brandId: null,
      retailers: [],
      retailerId: null,
      tempModemId: null,
    };
  },
  computed: {
    generalTitle() {
      if (this.pos.name) return `General ${this.pos.name} edit`;
      return "Add new PoS";
    },
    canCreateModem() {
      return this.$store.getters.hasAdminRole;
    },
    canCreateUnit() {
      return this.$store.getters.hasAdminRole;
    },
    posData() {
      return {
        name: this.name,
        brand: this.brand,
        address: this.address,
        postal_code: this.postalCode,
        manager_first_name: this.managerFirstName,
        manager_last_name: this.managerLastName,
        email: this.email,
        phone: this.formattedPhoneNumber,
        image: this.image,
        company_id: this.companyId,
        country_id: this.countryId,
        city: this.city,
        brand_id: this.brandId,
        retailer_id: this.retailerId,
      };
    },
    isNew() {
      return this.posId === "new";
    },
    posId() {
      return this.$route.params.posId;
    },
    // user can specify which unit edit modal to open
    unitId() {
      return this.$route.query.unitId;
    },
  },
  mounted() {
    if (this.unitId) {
      this.onEditUnit(this.unitId);
    }
    this.fetchData();
  },
  methods: {
    newimageAlbum(name) {
      this.newAlbumName = name;
      
    },
    deletePosAlbum(){
      setTimeout(() => {
        this.$refs.posImages.fetchData();
      }, 1500);
      setTimeout(() => {
        
        this.$bvToast.toast("Album deleted", {
          title: "Success",
          variant: "success",
          solid: true,
        });
      }, 1000);
    },
    deletePosAlbumImage(image) {

      if (this.image == image.path) {
        this.$refs.posImages.fetchData();
        this.removeCoverImageAndUpdate();
      } else {
        this.$refs.posImages.fetchData();
        this.fetchData();
      }
    },
    changeCoverPhoto(image) {
      this.image = image.path;
    },
    async onUnitCreate(unitId) {
      this.$refs.posUnits.fetchData();
      this.$refs.editUnitModal.hide();
      await this.fetchData();
      this.$refs.editUnitModal.show({
        posId: this.posId,
        unitId,
      });
    },
    onUnitUpdate() {
      this.$refs.posUnits.fetchData();
      this.fetchData();
    },
    onOrderMaintenance() {
      this.$refs.editMaintenanceModal.show({
        maintenancePosId: this.posId,
      });
    },
    onAddImage() {
      this.$bvModal.show("album_name_modal");
    },
    onUploadImageSuccess(path) {
      let data = new FormData();
      data.append("name", this.newAlbumName);
      data.append("path", path);
      this.handleCreate(
        createPosPhoto(this.posId, data),
        "Image"
      ).then(() => {
        this.currentImage = {};
        this.$refs.posImages.fetchData();
        this.$bvModal.hide("upload-pos-image-modal");
        this.fetchData();
      });
    },
    onEditUnit(unitId) {
      this.$refs.editUnitModal.show({
        posId: this.posId,
        unitId,
      });
    },
    onAddNewUnit() {
      this.$refs.editUnitModal.show({
        posId: this.posId,
        unitId: "new",
      });
    },
    onActivateModem(modemId) {
      activateModem(modemId, { point_of_sale_id: this.posId })
        .then(() => {
          this.$bvModal.hide("activate-modem-modal");
          this.$bvToast.toast("Modem successfully activated");
          this.$refs.modems.fetchData();
        })
        .catch((e) => {
          if (e.response.status === 404) {
            return this.$bvToast.toast("This activation code does not exist.", {
              variant: "danger",
              title: "Invalid activation code.",
            });
          }
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    },
    onDeleteModemButtonClick(modemId) {
      this.tempModemId = modemId;
      this.$bvModal.show("delete-modem-modal");
    },
    onDeleteModem() {
      this.handleDelete(removeModemFromPos(this.tempModemId)).then(() => {
        this.$refs.modems.fetchData();
      });
    },
    onCoverPhotoUpload(path) {
      this.image = path;
      if (!this.isNew) {
        this.currentImage.path = path;
        this.handleCreate(
          createPosPhoto(this.posId, this.currentImage),
          "Image"
        ).then(() => {
          this.currentImage = {};
          this.$refs.posImages.fetchData();
          this.onUpdate();
        });
      }
    },
    onSubmitAlbum(){
      let data = new FormData();
        
        data.append("name", this.albumName);
      
        
        createPosPhoto(this.posId, data).then(() => {
        this.albumName = "";
        this.$refs.posImages.fetchData();
        this.$bvModal.hide("album_name_modal");
        this.fetchData();
      });
    },
    onSubmit() {
      if (this.posId === "new") {
        this.handleCreate(createPos(this.posData), "Point of Sale").then(() => {
          this.$router.back();
        });
      } else {
        this.onUpdate();
      }
    },
    onDeleteImage() {
      this.$refs.posImages.deleteByPath(this.image);
    },
    removeCoverImageAndUpdate() {
      this.image = null;
      if (!this.isNew) this.onUpdate();
    },
    onUpdate() {
      this.handleUpdate(updatePos(this.posId, this.posData), "Point of Sale");
    },
    onDelete() {
      this.handleDelete(deletePos(this.posId), "Point of Sale").then(() => {
        this.$bvModal.hide("delete-pos-modal");
        this.$router.back();
      });
    },
    fetchData() {
      return this.handleFetch(
        Promise.all([
          this.isNew ? null : getPos(this.posId),
          getCompanyMetadata(),
          getPosMetadata(this.$store.getters.companyId),
        ])
      ).then(([posData, metaData, posMetadata]) => {
        this.brands = posMetadata.brands;
        this.retailers = posMetadata.retailers;
        if (!this.isNew) {
          this.pos = posData;
          this.name = posData.name;
          this.address = posData.address;
          this.postalCode = posData.postal_code;
          this.managerFirstName = posData.manager_first_name;
          this.retailerId = posData.retailer_id;
          this.brandId = posData.brand_id;
          this.managerLastName = posData.manager_last_name;
          this.email = posData.email;
          const parsedPhone = posData.phone
            ? parsePhoneNumber(posData.phone, "SI")
            : {};
          this.defaultCountryCode = parsedPhone.country;
          this.phoneNumber = parsedPhone.nationalNumber;
          this.formattedPhoneNumber = posData.phone;
          this.image = posData.image;
          this.countryId = posData.country_id;
          this.city = posData.city;
          this.activeModems = posData.active_modems;
          this.inactiveModems = posData.inactive_modems;
          this.activePlayers = posData.active_players;
          this.inactivePlayers = posData.inactive_players;
          this.photos = posData.photos;
        }
        this.countries = [
          { value: null, text: "Please select a country" },
          ...metaData.countries.map((e) => ({
            value: e.id,
            text: e.name,
          })),
        ];
      });
    },
    goBackAndActivateTableFilters() {
      //set vuex to use table filters to true
      this.$store.commit("setActivateFilter", true);
      this.$router.go(-1);
    },
  },
};
</script>
<style lang="scss">
.mo-edit-unit-modal {
  &__dialog {
    max-width: 90vw !important;
  }
}
.mo-pos-edit {
  // max-width: 1200px;
  .mo-dashboard-body {
    max-width: 85vw;
  }
  margin: auto;
  &__aligned {
    @media (max-width: 1450px) {
      max-width: 100vw;
    }
  }
  label,
  legend,
  input,
  select {
    font-size: 0.65rem !important;
  }
}
#cover-image-modal{
  overflow-y: hidden;
}
.sbmtBtn{
  padding: 25px;
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>
