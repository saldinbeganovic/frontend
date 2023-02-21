<template>
  <mo-dashboard :title="isNew ? 'Add modem' : 'Edit modem'">
    <template #body>
      <validation-observer class="h-100 w-100" v-slot="{ handleSubmit }">
        <b-modal
          id="qr-code-modal"
          content-class="mo-input-modal"
          body-class="mo-input-modal-body"
          hide-footer
          hide-header
          centered
        >
          <b-row
            class="w-100 d-flex justify-content-center flex-column align-items-center"
          >
            <div ref="qrCodePlaceholder" v-html="qrCode" />
            <p class="mt-2" style="font-size: 30px">{{ activationCode }}</p>
          </b-row>
          <b-row class="mt-3">
            <mo-button title="Download" @click="onDownloadQrCode" />
          </b-row>
        </b-modal>

        <mo-prompt-modal
          modal-id="delete-player-modal"
          message="Are you sure you want to delete this player ?"
          @right="onDelete"
        />
        <form
          class="d-flex flex-column justify-content-between h-100"
          @submit.prevent="handleSubmit(onSubmit)"
        >
          <mo-dashboard-body :loading="isLoading">
            <template #body>
              <b-col>
                <b-row class="mt-4 mb-2">
                  <h4>Modem info</h4>
                </b-row>
                <b-row>
                  <b-col class="mx-4">
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Notes"
                        label-for="notes"
                      >
                        <b-textarea
                          id="admin-password"
                          v-model="notes"
                          class="mo-input__light-sm"
                          placeholder="Notes"
                          type="text"
                          rows="5"
                        ></b-textarea>
                      </b-form-group>
                    </b-row>
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Admin password"
                        label-for="admin-password"
                      >
                        <b-form-input
                          id="admin-password"
                          v-model="adminPassword"
                          class="mo-input__light-sm"
                          placeholder="Admin password"
                          type="text"
                          disabled
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                  </b-col>
                  <b-col class="mx-4">
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Router model"
                        label-for="router-model"
                      >
                        <b-form-input
                          id="router-model"
                          v-model="routerModel"
                          class="mo-input__light-sm"
                          placeholder="Router model"
                          type="text"
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Router serial number"
                        label-for="router-serial"
                      >
                        <b-form-input
                          id="router-serial"
                          v-model="routerSerial"
                          class="mo-input__light-sm"
                          placeholder="Router serial number"
                          type="text"
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                  </b-col>
                  <b-col class="mx-4">
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Modem model"
                        label-for="player-model"
                      >
                        <b-form-input
                          id="player-model"
                          v-model="modemModel"
                          class="mo-input__light-sm"
                          placeholder="Modem model"
                          type="text"
                          required
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Modem serial number"
                        label-for="player-serial"
                      >
                        <b-form-input
                          id="player-serial"
                          v-model="modemSerial"
                          class="mo-input__light-sm"
                          placeholder="Modem serial number"
                          type="text"
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                  </b-col>
                </b-row>
                <b-row class="mt-4 mb-2">
                  <h4>Sim card info</h4>
                </b-row>
                <b-row>
                  <b-col class="mx-4">
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="ICCID"
                        label-for="iccid"
                        title="Tooltip content"
                      >
                        <template #label>
                          <span>ICCID</span>
                          <i
                            v-b-tooltip.hover
                            title="A unique 18-22 digit code that includes a SIM card’s country, home network, and identification number."
                            class="ml-2 fal fa-info-circle mo-text__light"
                          />
                        </template>
                        <b-form-input
                          id="iccid"
                          v-model="simIccid"
                          class="mo-input__light-sm"
                          placeholder="ICCID"
                          type="text"
                          required
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="MSISDN"
                        label-for="msisdn"
                      >
                        <template #label>
                          <span>MSISDN</span>
                          <i
                            v-b-tooltip.hover
                            title="A uniquely identifying a subscription in a Global System for Mobile communications or a Universal Mobile."
                            class="ml-2 fal fa-info-circle mo-text__light"
                          />
                        </template>
                        <b-form-input
                          id="msisdn"
                          v-model="simMsisdn"
                          class="mo-input__light-sm"
                          placeholder="MSISDN"
                          type="text"
                          required
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Provider id"
                        label-for="provider-id"
                      >
                        <b-form-select
                          id="provider-id"
                          v-model="simProviderId"
                          class="mo-input__light-sm"
                          :options="simProviderItems"
                          required
                        ></b-form-select>
                      </b-form-group>
                    </b-row>
                  </b-col>
                  <b-col class="mx-4">
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Pin 1"
                        label-for="pin-1"
                      >
                        <b-form-input
                          id="pin-1"
                          v-model="simPin1"
                          class="mo-input__light-sm"
                          placeholder="Pin 1"
                          type="number"
                          required
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Pin 2"
                        label-for="pin-2"
                      >
                        <b-form-input
                          id="pin-2"
                          v-model="simPin2"
                          class="mo-input__light-sm"
                          placeholder="Pin 2"
                          type="number"
                          required
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                  </b-col>
                  <b-col class="mx-4">
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Puk 1"
                        label-for="puk-1"
                      >
                        <b-form-input
                          id="puk-1"
                          v-model="simPuk1"
                          class="mo-input__light-sm"
                          placeholder="Puk 1"
                          type="number"
                          required
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                    <b-row>
                      <b-form-group
                        class="w-100"
                        label="Puk 2"
                        label-for="puk-2"
                      >
                        <b-form-input
                          id="puk-2"
                          v-model="simPuk2"
                          class="mo-input__light-sm"
                          placeholder="Puk 2"
                          type="number"
                          required
                        ></b-form-input>
                      </b-form-group>
                    </b-row>
                  </b-col>
                </b-row>
              </b-col>
            </template>
            <template #footer-left>
              <mo-button
                v-if="!isNew"
                title="Delete"
                variant="danger"
                @click="$bvModal.show('delete-player-modal')"
              />
              <mo-button
                v-if="!isNew"
                class="ml-5"
                title="Download config"
                outline
                @click="onDownloadConfig"
              />
              <mo-button
                v-if="!isNew"
                width="240px"
                class="ml-2"
                title="Copy activation code"
                outline
                @click="onCopyActivationCode"
              />
              <mo-button
                v-if="!isNew"
                class="ml-2"
                title="Qr code"
                outline
                @click="onShowQrCode"
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
                v-else
                class="mr-2"
                type="submit"
                title="Update"
                :loading="isSubmitting"
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
  createModem,
  deleteModem,
  getModem,
  getModemConfig,
  getModemMetadata,
  updateModem
} from "@/api/admin/device/modem";
import { getPointsOfSale } from "@/api/admin/company/point-of-sale";
import { getModemQrCode } from "@/api/admin/device/modem";

export default {
  name: "Overview",
  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      posItems: [],
      simProviderItems: [],
      posId: null,
      apiPassword: "",
      adminPassword: "",
      notes: "",
      routerSerial: "",
      routerModel: "",
      modemSerial: "",
      modemModel: "",
      activationCode: "",
      cert: "",
      key: "",
      simIccid: "",
      simMsisdn: "",
      simPin1: "",
      simPin2: "",
      simPuk1: "",
      simPuk2: "",
      simProviderId: null,
      hostname: null,
      uuid: null,
      qrCode: null
    };
  },
  computed: {
    isNew() {
      return this.modemId === "new";
    },
    modemId() {
      return this.$route.params.modemId;
    },
    modemData() {
      return {
        api_password: this.apiPassword,
        notes: this.notes,
        router_serial: this.routerSerial,
        router_model: this.routerModel,
        modem_serial: this.modemSerial,
        modem_model: this.modemModel,
        cert: this.cert,
        point_of_sale_id: this.posId,
        key: this.key,
        sim: {
          iccid: this.simIccid,
          msisdn: this.simMsisdn,
          pin1: parseFloat(this.simPin1),
          pin2: parseFloat(this.simPin2),
          puk1: parseFloat(this.simPuk1),
          puk2: parseFloat(this.simPuk2),
          provider_id: this.simProviderId
        }
      };
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onCopyActivationCode() {
      navigator.clipboard
        .writeText(this.activationCode)
        .then(() => {
          this.$bvToast.toast(
            "Modem's activation code was copied to the clipboard!"
          );
        })
        .catch(e => {
          this.$bvToast.toast(
            `Error copying activation code to clipboard: ${e.message}`
          );
        });
    },
    onDownloadConfig() {
      getModemConfig(this.modemId).then(response => {
        let objectUrl = window.URL.createObjectURL(response.data);
        let anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = `config-${this.hostname}.rsc`;
        anchor.click();
        window.URL.revokeObjectURL(objectUrl);
      });
    },
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
      this.handleCreate(createModem(this.modemData), "Modem").then(() => {
        this.$router.back();
      });
    },
    onDelete() {
      this.handleDelete(deleteModem(this.modemId), "Modem").then(() => {
        this.$router.back();
      });
    },
    onUpdate() {
      this.handleUpdate(updateModem(this.modemId, this.modemData), "Modem");
    },
    fetchData() {
      this.handleFetch(
        Promise.all([getPointsOfSale(), getModemMetadata()])
      ).then(([pointsOfSale, metadata]) => {
        this.simProviderItems = [
          { value: null, text: "Please select your sim provider" },
          ...metadata.sim_providers.map(e => ({
            value: e.id,
            text: e.name
          }))
        ];
        this.posItems = [
          { value: null, text: "Please select point of sale" },
          ...pointsOfSale.map(e => ({
            value: e.id,
            text: `${e.name} - ${e.address}`
          }))
        ];
      });
      if (!this.isNew) {
        this.handleFetch(getModem(this.modemId)).then(data => {
          this.adminPassword = data.admin_password;
          this.notes = data.notes;
          this.routerSerial = data.router_serial;
          this.routerModel = data.router_model;
          this.modemModel = data.modem_model;
          this.modemSerial = data.modem_serial;
          this.simProviderId = data.sim_card.provider.id;
          this.simIccid = data.sim_card.iccid;
          this.simMsisdn = data.sim_card.msisdn;
          this.simPin1 = data.sim_card.pin1;
          this.simPin2 = data.sim_card.pin2;
          this.simPuk1 = data.sim_card.puk1;
          this.simPuk2 = data.sim_card.puk2;
          this.posId = data.point_of_sale_id;
          this.uuid = data.uuid;
          this.activationCode = data.activation_code;
          this.hostname = data.hostname;
          this.handleFetch(
            Promise.all([
              fetch(
                `${process.env.VUE_APP_S3_HOST}/${data.cert_path}`
              ).then(res => res.text()),
              fetch(
                `${process.env.VUE_APP_S3_HOST}/${data.key_path}`
              ).then(res => res.text())
            ])
          )
            .then(([certData, keyData]) => {
              this.cert = certData;
              this.key = keyData;
            })
            .catch(() => {
              this.$bvToast.toast(
                "Couldn't fetch modem certificate & key for unknown reason.",
                {
                  variant: "danger",
                  title: "Failed to fetch credentials."
                }
              );
            });
        });
      }
    },
    onShowQrCode() {
      this.handleFetch(getModemQrCode(this.modemId), "svg").then(data => {
        this.qrCode = data;
        this.$bvModal.show("qr-code-modal");
        const size = "200px";
        this.$nextTick(() => {
          const svg = this.$refs.qrCodePlaceholder.querySelector("svg");
          svg.style.width = size;
          svg.style.height = size;
        });
      });
    },
    onDownloadQrCode() {
      getModemQrCode(this.modemId, "png", { responseType: "blob" }).then(
        blob => {
          let objectUrl = window.URL.createObjectURL(blob);
          let anchor = document.createElement("a");
          anchor.href = objectUrl;
          anchor.download = `${this.modemId}_modem_code.png`;
          anchor.click();
          window.URL.revokeObjectURL(objectUrl);
        }
      );
    }
  }
};
</script>
