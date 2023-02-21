<template>
  <validation-observer class="h-100 w-100" v-slot="{ handleSubmit }">
    <b-modal
      id="qr-code-modal"
      content-class="mo-input-modal"
      body-class="mo-input-modal-body"
      hide-footer
      hide-header
      centered
    >
      <b-row class="w-100 d-flex justify-content-center">
        <div ref="qrCodePlaceholder" v-html="qrCode" />
      </b-row>
      <b-row class="mt-3">
        {{activation_code}}  
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
          <b-col v-if="displayName" class="mx-4">
            <b-row>
              <b-form-group class="w-100" label="Company">
                <b-form-input
                  disabled
                  v-model="companyName"
                  class="mo-input__light-sm"
                  type="text"
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <b-form-group class="w-100" label="Point of Sale">
                <b-form-input
                  disabled
                  v-model="pointsOfSaleName"
                  class="mo-input__light-sm"
                  type="text"
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <b-form-group class="w-100" label="Unit">
                <b-form-input
                  disabled
                  v-model="unitName"
                  class="mo-input__light-sm"
                  type="text"
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <b-form-group class="w-100" label="Display">
                <b-form-input
                  disabled
                  v-model="displayName"
                  class="mo-input__light-sm"
                  type="text"
                ></b-form-input>
              </b-form-group>
            </b-row>
          </b-col>
          <b-col class="mx-4">
            <b-row>
              <b-form-group
                class="w-100"
                label="SD card brand"
                label-for="sd-brand"
              >
                <b-form-input
                  id="sd-brand"
                  v-model="sdBrand"
                  class="mo-input__light-sm"
                  placeholder="SD card brand"
                  type="text"
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <b-form-group
                class="w-100"
                label="SD card size (in GB)"
                label-for="sd-size"
              >
                <b-form-input
                  id="sd-size"
                  v-model="sdSize"
                  class="mo-input__light-sm"
                  placeholder="SD card size"
                  type="number"
                  required
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <b-form-group class="w-100" label="Notes" label-for="notes">
                <b-textarea
                  id="notes"
                  v-model="notes"
                  class="mo-input__light-sm"
                  placeholder="Notes"
                  type="text"
                  rows="5"
                ></b-textarea>
              </b-form-group>
            </b-row>
          </b-col>
          <b-col class="mx-4">
            <b-row align-h="between">
           
              <b-col class="myClass">
              <b-form-group class="mb-2" label="Player ID">
                <b-form-input
                  disabled
                  v-model="playerId"
                  class="mo-input__light-sm"
                  type="text"
                ></b-form-input>
              </b-form-group>
              </b-col>
              <b-col class="myClass">
              <b-form-group class="mb-2 " label="Status" style="float:right">
              
                <mo-status-badge
                  :title="state ? 'Online' : 'Offline'"
                  :variant="state ? 'success' : 'danger'"
                  :clickable="false"
                />
              </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-form-group class="w-100" label="Hostname">
                <b-form-input
                  disabled
                  v-model="hostname"
                  class="mo-input__light-sm"
                  type="text"
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <b-form-group class="w-100" label="Uuid">
                <b-form-input
                  disabled
                  v-model="uuid"
                  class="mo-input__light-sm"
                  type="text"
                ></b-form-input>
              </b-form-group>
            </b-row>
            <b-row>
              <b-form-group class="w-100" label="Password">
                <b-form-input
                  disabled
                  v-model="password"
                  class="mo-input__light-sm"
                  type="text"
                ></b-form-input>
              </b-form-group>
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
            title="Copy config"
            outline
            @click="onCopyConfig"
          />
          <mo-button
            v-if="!isNew"
            class="ml-2"
            width="290px"
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

<script>
import {
  createPlayer,
  deletePlayer,
  getPlayer,
  getPlayerQrCode,
  updatePlayer
} from "@/api/admin/device/player";

export default {
  name: "Overview",
  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      unitItems: [],
      sdBrand: "",
      sdSize: "",
      notes: "",
      hostname: "",
      password: "",
      unitId: null,
      unitName: "",
      companyName: "",
      pointsOfSaleName: "",
      displayName: "",
      state: false,
      qrCode: null,
      psk: "",
      uuid: null,
      activationCode: null
    };
  },
  computed: {
    isNew() {
      return this.playerId === "new";
    },
    playerId() {
      return this.$route.params.playerId;
    },
    playerData() {
      return {
        sd_brand: this.sdBrand,
        sd_size: parseFloat(this.sdSize),
        notes: this.notes
      };
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    
    onShowQrCode() {
      this.handleFetch(getPlayerQrCode(this.playerId), "svg").then(data => {
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
      getPlayerQrCode(this.playerId, "png", { responseType: "blob" }).then(
        blob => {
          let objectUrl = window.URL.createObjectURL(blob);
          let anchor = document.createElement("a");
          anchor.href = objectUrl;
          anchor.download = `${this.playerId}_player_code.png`;
          anchor.click();
          window.URL.revokeObjectURL(objectUrl);
        }
      );
    },
    onCopyConfig() {
      const text = `curl ${process.env.VUE_APP_API_HOST}/api/players/${this.uuid}/config | sudo -E bash`;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.$bvToast.toast("Config command was copied to the clipboard!");
        })
        .catch(e => {
          this.$bvToast.toast(
            `Error copying config to clipboard: ${e.message}`
          );
        });
    },
    onCopyActivationCode() {
      navigator.clipboard
        .writeText(this.activationCode)
        .then(() => {
          this.$bvToast.toast(
            "Player's activation code was copied to the clipboard!"
          );
        })
        .catch(e => {
          this.$bvToast.toast(
            `Error copying activation code to clipboard: ${e.message}`
          );
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
      this.isSubmitting = true;
      this.handleCreate(
        createPlayer(this.playerData).then(data => {
          this.$router.replace(`/admin/device/player/${data.id}`);
        }),
        "Player"
      );
    },
    onDelete() {
      this.handleDelete(
        deletePlayer(this.playerId).then(() => {
          this.$router.back();
        }),
        "Player"
      );
    },
    onUpdate() {
      this.isSubmitting = true;
      this.handleUpdate(updatePlayer(this.playerId, this.playerData), "Player");
    },
    fetchData() {
      if (!this.isNew) {
        getPlayer(this.playerId)
          .then(player => {
            this.sdSize = player.sd_size;
            this.notes = player.notes;
            this.sdBrand = player.sd_brand;
            this.uuid = player.uuid;
            this.activation_code = player.activation_code;

            this.hostname = player.hostname;
            this.password = player.password;
            if (player.unit) {
              this.unitName = player.unit.title;
              this.pointsOfSaleName = player.unit.point_of_sale.name;
              this.companyName = player.unit.point_of_sale.company.name;
            }
            if (player.display) {
              this.displayName =
                player.display.producer +
                " " +
                player.display.width +
                " x " +
                player.display.height;
            }
            this.state = player.state;
            this.activationCode = player.activation_code;
          })
          .catch(e => {
            this.$bvToast.toast(e.response.data.message, { variant: "danger" });
          });
      }
    }
  }
};
</script>
<style>
  .myClass{
    padding-left: 0px !important;
  }
</style>
