<template>
  <validation-observer class="h-100 w-100" v-slot="{ handleSubmit }">
    <form
      class="d-flex flex-column justify-content-between h-100"
      @submit.prevent="handleSubmit(onSubmit)"
    >
      <mo-dashboard-body :is-footer-top="false">
        <template #body>
          <mo-image-gallery
            modal-id="printing-order-visual-photo"
            :images="currentVisualPhoto"
          />
          <b-col>
            <b-row class="w-100">
              <b-col>
                <b-row>
                  <b-col>
                    <h3 class="text-center font-weight-light mb-5">
                      Enter printing info
                    </h3>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <b-form-group
                      label="Ordered by"
                      label-for="requestUser"
                      label-cols="5"
                      label-size="sm"
                    >
                      <b-form-input
                        id="requestUser"
                        v-model="requestUser"
                        placeholder="Ordered by"
                        type="requestUser"
                        autocomplete="requestUser"
                        disabled
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group
                      label="Printing house"
                      label-for="company"
                      label-cols="5"
                      label-size="sm"
                    >
                      <b-form-select
                        id="company"
                        v-model="selectedHouseId"
                        :options="houses"
                        required
                      ></b-form-select>
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group
                      label="Purchase order number"
                      label-for="title"
                      label-cols="5"
                      label-size="sm"
                    >
                      <b-form-input
                        id="purchase-order-number"
                        v-model="purchaseOrderNumber"
                        placeholder="Purchase order number"
                        type="text"
                        maxlength="250"
                        required
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row>
                  <b-col cols="4">
                    <b-form-group
                      label="For company"
                      label-for="company"
                      label-cols="5"
                      label-size="sm"
                    >
                      <b-form-input
                        id="company"
                        v-model="companyName"
                        placeholder=""
                        type="text"
                        maxlength="250"
                        disabled
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                  <b-col cols="4">
                    <b-form-group
                      label="Delivery date *"
                      label-for="delivery-date"
                      label-cols="5"
                      label-size="sm"
                    >
                      <validation-provider
                        name="deadline"
                        class="w-100"
                        :rules="`deadline`"
                        v-slot="{ errors, valid }"
                      >
                        <b-form-input
                          id="delivery-date"
                          v-model="deliveryDeadline"
                          placeholder="Date"
                          :state="valid"
                          type="date"
                          required
                        ></b-form-input>
                        <span v-if="!valid" class="text-danger">{{
                          errors[0]
                        }}</span>
                      </validation-provider>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col cols="4">
                    <b-form-group
                      label="For campaign"
                      label-for="campaign"
                      label-cols="5"
                      label-size="sm"
                    >
                      <b-form-select
                        id="campaign"
                        v-model="existingCampaignId"
                        class="mo-input__light-sm"
                        :options="existingCampaigns"
                        required
                      ></b-form-select>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col cols="4">
                    <b-form-group
                      label="Delivery type"
                      label-for="delivery-type"
                      label-cols="5"
                      label-size="sm"
                    >
                      <b-form-select
                        id="delivery-type"
                        v-model="deliveryTypeId"
                        class="mo-input__light-sm"
                        :options="deliveryTypes"
                        required
                      ></b-form-select>
                    </b-form-group>
                  </b-col>
                  <b-col cols="4">
                    <b-form-group
                      v-if="deliveryTypeId === 3"
                      label="Delivery address"
                      label-cols="5"
                      label-size="sm"
                      label-for="delivery-location"
                    >
                      <b-form-input
                        id="delivery-location"
                        v-model="deliveryAddress"
                        placeholder="Address"
                        type="text"
                        required
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col cols="4">
                    <b-form-group
                      label="Date of order"
                      label-for="today-date"
                      label-cols="5"
                      label-size="sm"
                    >
                      <b-form-input
                        id="today-date"
                        v-model="dateNow"
                        placeholder="Date"
                        type="text"
                        disabled
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <h5>
                      Visuals
                    </h5>
                  </b-col>
                </b-row>
                <b-row v-if="visuals">
                  <b-col>
                    <mo-table
                      ref="table"
                      empty-text="No visuals to show"
                      table-class="mo-visuals"
                      :items="visuals"
                      :fields="visualFields"
                      :loading="isLoading"
                      max-height="300px"
                      @edit="onEditGraphic"
                      :show-select-all="false"
                      :show-id-field="false"
                    >
                      <template #cell(photo)="{item}">
                        <img
                          v-if="item.photo"
                          class="rounded"
                          style="height: 40px;width: 40px; cursor: pointer;"
                          alt=""
                          :src="toS3Url(item.photo)"
                          @click="onViewVisualImage(item.photo)"
                        />
                        <i
                          v-else
                          class="fa fa-image mo-company-icon"
                          style="font-size: 30px;"
                        />
                      </template>
                    </mo-table>
                  </b-col>
                </b-row>
                <b-row class="mt-3">
                  <b-col>
                    <h5>
                      Campaign files
                    </h5>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <mo-table
                      ref="table"
                      empty-text="No graphics to show"
                      table-class="mo-visual-order-modal"
                      :items="graphicItemsFiltered"
                      :fields="fields"
                      :loading="isLoading"
                      max-height="300px"
                      @edit="onEditGraphic"
                      :show-select-all="false"
                    >
                      <template #cell(size)="{item}">
                        <span>{{ formatBytes(item.size) }}</span>
                      </template>
                      <template #cell(path)="{item}">
                        <span>{{
                          fileType(item.path) || getFallbackType(item.id)
                        }}</span>
                      </template>
                    </mo-table>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
          </b-col>
        </template>
        <template #footer-left>
          <b-col>
            <mo-button
              width="220px"
              title="Create and send PDF"
              type="submit"
            />
          </b-col>
        </template>
      </mo-dashboard-body>
    </form>
  </validation-observer>
</template>

<script>
import {
  getVisualCampaign,
  getVisualCampaignsOfCompany
} from "@/api/user/campaigns/campaigns";
import { createPrintingOrder } from "@/api/user/campaigns/printing-orders";
import { getPrintingHousesOfCompany } from "@/api/user/campaigns/printing-houses";
import { formatDate } from "@/utils/utils";
import { getGraphicsOfCompany } from "@/api/user/campaigns/graphics";
import { getPos } from "@/api/admin/company/point-of-sale";
import { getCompany } from "@/api/admin/company/company";
import MoImageGallery from "@/components/pure/modals/MoImageGallery";

export default {
  name: "MoVisualOrderModal",
  components: { MoImageGallery },
  props: {
    posUnitsVisualsObject: {
      type: Object
    },
    visuals: {
      type: [Object, Array]
    },
    existingVisualOrder: {
      type: Object
    }
  },
  data() {
    return {
      requestUser: "",
      existingCampaigns: [],
      purchaseOrderNumber: "",
      existingVisuals: [],
      existingCampaignId: null,
      isLoading: false,
      selectedHouseId: null,
      deliveryTypeId: null,
      houses: [],
      deliveryDeadline: "",
      deliveryAddress: "",
      description: "",
      title: "",
      graphicItems: [],
      graphicItemsFiltered: [],
      company: null,
      pos: {},
      currentVisualPhoto: [],
      fields: [
        { key: "title", label: "File name" },
        {
          key: "size",
          label: "Size",
          formatter: this.formatBytes
        },
        {
          key: "path",
          label: "Type",
          formatter: value => this.fileType(value)
        },
        { key: "created_at", label: "Uploaded date", formatter: formatDate }
      ],
      visualFields: [
        {
          key: "photo",
          label: "Photo",
          sortable: false
        },
        {
          key: "notes",
          label: "Name",
          sortable: false
        },
        {
          key: "material.name",
          label: "Material",
          sortable: false
        },
        {
          key: "visible_width",
          label: "Visible width (mm)",
          sortable: false
        },
        {
          key: "visible_height",
          label: "Visible height (mm)",
          sortable: false
        },
        {
          key: "printable_width",
          label: "Printable width (mm)",
          sortable: false
        },
        {
          key: "printable_height",
          label: "Printable height (mm)",
          sortable: false
        },
        {
          key: "comment",
          label: "Comment",
          sortable: false
        }
      ],
      deliveryTypes: [
        { value: 1, text: "To each Point of Sale" },
        { value: 2, text: "To group headquarters" },
        { value: 3, text: "To a new address" }
      ]
    };
  },
  computed: {
    selectedVisuals() {
      let temp = [];
      if (this.existingVisualOrder)
        return this.existingVisualOrder.visuals.map(e => e.id);
      Object.values(this.posUnitsVisualsObject).forEach(pos => {
        Object.values(pos).forEach(function(unit) {
          temp = temp.concat(unit);
        });
      });
      return temp;
    },
    userFullName() {
      let user = this.$store.getters.getUser;
      return user ? user.first_name + " " + user.last_name : "";
    },
    companyName() {
      return this.isAdminDashboard ? "" : this.$store.getters.getCompanyName;
    },
    dateNow() {
      let date = new Date();
      let yy = date.getFullYear();
      let mm = date.getMonth();
      let dd = date.getDate();
      return `${mm < 10 ? 0 : ""}${mm + 1}/${dd < 10 ? 0 : ""}${dd}/${yy}`;
    }
  },
  async mounted() {
    this.requestUser = this.userFullName;
    await this.fetchData();
    if (this.existingVisualOrder) this.setData();
  },
  watch: {
    existingCampaignId(value) {
      if (value) {
        this.handleFetch(getVisualCampaign(value)).then(data => {
          this.title = data.title;
          this.description = data.description;
          if (data.details)
            this.existingVisuals = data.details
              .map(e => e.visuals.map(e => e.id))
              .flat();
          this.graphicItemsFiltered = this.graphicItems.filter(graphicItemE =>
            data.attachments.some(
              attachmentsE => graphicItemE.id === attachmentsE.id
            )
          );
        });
      } else {
        this.title = "";
        this.description = "";
        this.deliveryTypeId = null;
        this.existingVisuals = [];
      }
    }
  },
  methods: {
    onSubmit() {
      this.createPrintingOrder()
        .then(() => {
          this.$bvToast.toast("Printing order was successfully sent!");
        })
        .finally(() => {
          this.$emit("done");
        });
    },
    createPrintingOrder() {
      return this.handleCreate(
        createPrintingOrder({
          printing_house_id: this.selectedHouseId,
          deadline: this.deliveryDeadline,
          visual_campaign_id: this.existingCampaignId,
          visuals: this.selectedVisuals,
          addresses: this.existingVisualOrder
            ? this.existingVisualOrder.addresses.map(e => e.name)
            : this.addressForType(this.deliveryTypeId),
          shipping_type: this.deliveryTypeId,
          purchase_order_number: this.purchaseOrderNumber
        }),
        "Print order"
      );
    },
    addressForType(shippingType) {
      switch (shippingType) {
        case 1:
          return Object.keys(this.posUnitsVisualsObject).map(
            key => this.pos[key].address
          );
        case 2:
          return [this.company.address];
        case 3:
          return [this.deliveryAddress];
      }
    },
    onEditGraphic(graphicId) {
      this.$router.push(`/user/campaign/graphic/${graphicId}`);
    },
    fetchData() {
      return this.handleFetch(
        Promise.all([
          getVisualCampaignsOfCompany(this.$store.getters.companyId),
          getGraphicsOfCompany(this.$store.getters.companyId),
          getPrintingHousesOfCompany(this.$store.getters.companyId),
          getCompany(this.$store.getters.companyId)
        ])
      ).then(([campaigns, graphicsData, printingHouses, company]) => {
        this.existingCampaigns = [
          ...campaigns.map(e => ({
            value: e.id,
            text: `#${e.id} - ${e.title} - ${e.description}`
          }))
        ];
        this.company = company;
        this.houses = printingHouses.map(e => ({
          value: e.id,
          text: e.name
        }));
        this.graphicItems = graphicsData;
        //fetch all the PoS info for each PoS
        if (!this.existingVisualOrder)
          Object.keys(this.posUnitsVisualsObject).forEach(key => {
            this.handleFetch(Promise.all([getPos(key)])).then(([data]) => {
              this.$set(this.pos, key, data);
            });
          });
      });
    },
    setData() {
      this.deliveryDeadline = this.existingVisualOrder.deadline;

      this.existingCampaignId = this.existingVisualOrder.visual_campaign_id;

      this.deliveryTypeId = this.existingVisualOrder.shipping_type;
      if (this.deliveryTypeId === 3)
        this.deliveryAddress = this.existingVisualOrder.addresses[0].name;
      this.selectedHouseId = this.existingVisualOrder.printing_house_id;
      this.purchaseOrderNumber = this.existingVisualOrder.purchase_order_number;
    },
    onViewVisualImage(path) {
      this.currentVisualPhoto = [{ path }];
      this.$bvModal.show("printing-order-visual-photo");
    }
  }
};
</script>
<style lang="scss">
// label[for="campaign"] {
//   font-weight: bold;
// }
.mo-visuals {
  overflow: hidden;
  th {
    white-space: unset;
  }
  th,
  td {
    text-align: center;
  }
}
.mo-visual-order-modal {
  .title {
    max-width: 140px;
  }
  td {
    text-align: center;
  }
}
</style>
