<template>
  <validation-observer class="h-100 w-100" v-slot="{ handleSubmit }">
    <form
      class="d-flex flex-column justify-content-between h-100"
      @submit.prevent="handleSubmit(onSubmit)"
    >
      <mo-dashboard-body :is-footer-top="false">
        <template #body>
          <mo-image-gallery
            modal-id="decorating-order-visual-photo"
            :images="currentVisualPhoto"
          />
          <b-col>
            <b-row>
              <b-col>
                <b-row>
                  <b-col>
                    <h3 class="text-center font-weight-light mb-5">
                      Enter decorating info
                    </h3>
                  </b-col>
                </b-row>
                <b-row class="mt-4">
                  <b-col>
                    <b-form-group
                      label-cols="5"
                      label-size="sm"
                      label="Delivery type"
                      label-for="delivery-type"
                    >
                      <b-form-select
                        id="delivery-type"
                        v-model="deliveryTypeId"
                        class="mo-input__light-sm"
                        :options="deliveryTypes"
                        required
                      ></b-form-select>
                    </b-form-group>
                    <b-form-group
                      label-cols="5"
                      label-size="sm"
                      v-if="deliveryTypeId === 3"
                      label="Delivery address"
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
                    <b-form-group
                      label-cols="5"
                      label-size="sm"
                      label="Decorating house"
                      label-for="company"
                    >
                      <b-form-select
                        id="company"
                        v-model="selectedHouseId"
                        class="mo-input__light-sm"
                        :options="houses"
                        required
                      ></b-form-select>
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group
                      label-cols="5"
                      label-size="sm"
                      label="Delivery date"
                      label-for="delivery-date"
                    >
                      <validation-provider
                        name="deadline"
                        class="w-100"
                        :rules="`deadline|after-print-date:${printDeadline}`"
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
                    <b-form-group
                      label-cols="5"
                      label-size="sm"
                      label="Finish date"
                      label-for="finish-date"
                    >
                      <validation-provider
                        name="deadline"
                        class="w-100"
                        :rules="finishDateValidationRules"
                        v-slot="{ errors, valid }"
                      >
                        <b-form-input
                          id="finish-date"
                          v-model="finishDeadline"
                          placeholder="Date"
                          :state="valid"
                          type="date"
                        ></b-form-input>
                        <span v-if="!valid" class="text-danger">{{
                          errors[0]
                        }}</span>
                      </validation-provider>
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
                  <mo-table
                    v-if="showTable"
                    :fields="visualFields"
                    :initial-selected="initialSelected"
                    table-class="mo-decorating-order-visuals-table"
                    :filter-values="{ 'type.name': visualFilter }"
                    :items="visuals"
                    :show-id-field="false"
                    :show-edit-button="false"
                    @select="selectedVisuals = $event"
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
                </b-row>
              </b-col>
            </b-row>
          </b-col>
        </template>
        <template #footer-left>
          <mo-button
            :loading="isSubmitting"
            width="220px"
            title="Create and send PDF"
            type="submit"
          />
        </template>
      </mo-dashboard-body>
    </form>
  </validation-observer>
</template>

<script>
import { getVisualCampaign } from "@/api/user/campaigns/campaigns";
import { createDecoratingOrder } from "@/api/user/campaigns/decorating-orders";
import { getPos } from "@/api/admin/company/point-of-sale";
import { getCompany } from "@/api/admin/company/company";
import { getDecoratingHousesOfCompany } from "@/api/user/campaigns/decorating-houses";
import MoImageGallery from "@/components/pure/modals/MoImageGallery";

export default {
  name: "MoDecoratingOrderModal",
  components: { MoImageGallery },
  props: {
    pointOfSaleId: {
      type: Number
    },
    campaignId: {
      type: Number,
      required: true
    },
    visuals: {
      type: [Array, Object]
    },
    lastCampaign: {
      type: [Array, Object]
    },
    existingOrder: {
      type: Object
    }
  },
  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      selectedHouseId: null,
      campaign: null,
      deliveryTypeId: null,
      houses: [],
      purchaseOrderNumber: "",
      deliveryDeadline: "",
      finishDeadline: "",
      deliveryAddress: "",
      description: "",
      title: "",
      company: null,
      pos: null,
      visualFilter: "",
      // selectedVisuals: this.visuals.map((e) => e.id),
      selectedVisuals: [],
      printDeadline: null,
      initialSelected: {},
      showTable: false,
      currentVisualPhoto: [],
      visualFields: [
        {
          key: "select"
        },
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
        },
        {
          key: "select",
          label: "Checkbox"
        }
      ],
      deliveryTypes: [
        { value: 1, text: "To each Point of Sale" },
        { value: 2, text: "To group headquarters" },
        { value: 3, text: "To a new address" }
      ]
    };
  },
  created() {
    this.fetchData();
  },
  mounted() {
    if (this.existingOrder) this.setData();
  },
  computed: {
    finishDateValidationRules() {
      return (
        "deadline" +
        (this.deliveryDeadline
          ? `|after-print-date:${this.deliveryDeadline}`
          : "")
      );
    }
  },
  methods: {
    onSubmit() {
      this.isSubmitting = true;
      this.handleUpdate(
        createDecoratingOrder(
          {
            decorating_house_id: this.selectedHouseId,
            deadline_start: this.deliveryDeadline,
            deadline_end: this.finishDeadline,
            visual_campaign_id: this.campaignId,
            visuals: this.selectedVisuals,
            addresses: this.existingOrder
              ? this.existingOrder.addresses.map(e => e.name)
              : this.addressForType(this.deliveryTypeId),
            shipping_type: this.deliveryTypeId,
            purchase_order_number: this.purchaseOrderNumber
          },
          "Decorating order"
        )
      )
        .then(() => {
          this.$emit("done");
          this.$bvToast.toast("Decorating order was successfully sent!");
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
    addressForType(shippingType) {
      if (this.lastCampaign.shipping_type === 1) {
        return this.lastCampaign.addresses.map(e => e.name);
      }
      switch (shippingType) {
        case 1:
          return [this.pos.address];
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
      this.handleFetch(
        Promise.all([
          getDecoratingHousesOfCompany(this.$store.getters.companyId),
          getCompany(this.$store.getters.companyId),
          getVisualCampaign(this.campaignId)
        ])
      )
        .then(([decoratingHouses, company, campaign]) => {
          if (this.pointOfSaleId)
            getPos(this.pointOfSaleId).then(pos => {
              this.pos = pos;
            });
          this.company = company;
          this.campaign = campaign;
          this.selectedVisuals = this.visuals.map(e => e.id);
          this.initialSelected = this.selectedVisuals.reduce(
            (p, c) => ((p[c] = true), p),
            {}
          );

          if (this.lastCampaign) {
            //set deadline of last printing order, so that you cannot select date befor this date
            this.printDeadline = this.lastCampaign.deadline;
            this.deliveryTypeId = this.lastCampaign.shipping_type;
            if (this.deliveryTypeId === 3)
              this.deliveryAddress = this.lastCampaign.addresses[0].name;
            this.purchaseOrderNumber = this.lastCampaign.purchase_order_number;
          }

          this.houses = decoratingHouses.map(e => ({
            value: e.id,
            text: e.name
          }));
          if (campaign.decorating_orders.length > 0) {
            this.selectedHouseId =
              campaign.decorating_orders[
                campaign.decorating_orders.length - 1
              ].decorating_house_id;
          }
        })
        .finally(() => {
          this.showTable = true;
        });
    },
    setData() {
      this.selectedHouseId = this.existingOrder.decorating_house_id;
      this.deliveryDeadline = this.existingOrder.deadline_start;
      this.finishDeadline = this.existingOrder.deadline_end;
      this.deliveryTypeId = this.existingOrder.shipping_type;
      if (this.deliveryTypeId === 3)
        this.deliveryAddress = this.existingOrder.addresses[0].name;
      this.purchaseOrderNumber = this.existingOrder.purchase_order_number;
    },
    onViewVisualImage(path) {
      this.currentVisualPhoto = [{ path }];
      this.$bvModal.show("decorating-order-visual-photo");
    }
  }
};
</script>
<style lang="scss" scoped>
.mo-decorating-order-visuals-table {
  overflow: hidden;
  th {
    white-space: unset;
  }
  th,
  td {
    text-align: center;
  }
}
</style>
