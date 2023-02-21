<template>
  <b-modal
    :id="modalId"
    hide-footer
    hide-header
    size="lg"
    centered
    body-class="mo-input-modal-body"
    dialog-class="mo-player__modal"
  >
    <h3 class="text-center font-weight-light mb-5">
      Connect player
    </h3>
    <b-form class="mo-player__form" @submit.prevent="onSubmit">
      <b-form-group
        v-if="unitId"
        label="Select Display"
        label-for="display-input"
      >
        <b-form-select
          id="display-input"
          v-model="displayId"
          :options="displayOptions"
          class="mo-input__light-sm w-100"
          required
        ></b-form-select>
      </b-form-group>
      <p v-if="!ifDisplayIdIsSet">
        <i>Please select the display before selecting the player.</i>
      </p>

      <b-form-group
        v-if="$store.getters.getUser.is_admin"
        label="Select existing player (only admin sees this)"
        label-for="player-select"
      >
        <b-form-select
          class="mo-input__light-sm form-control"
          :options="playerOptions"
          :disabled="!ifDisplayIdIsSet"
          v-model="playerId"
        >
        </b-form-select>
      </b-form-group>

      <b-form-group label="Enter player code" label-for="player-input">
        <mo-code-input :code-length="7" @change="playerId = $event" />
      </b-form-group>
      <b-button type="submit" class="mo-btn mt-4">Submit</b-button>
    </b-form>
  </b-modal>
</template>

<script>
import { getUnitDisplays } from "@/api/admin/company/unit/display";
import { getPlayersOfCompany } from "@/api/admin/device/player";

export default {
  name: "MoEmailModal",
  props: {
    modalId: {
      type: String,
      required: true,
    },
    unitId: {
      type: String,
    },
    preselectedDisplayId: {
      type: [String, Number],
    },
    unsavedDisplays: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      displayId: null,
      playerId: null,
      displays: [],
      players: [],
      playerOptions: [],
      displayOptions: [],
    };
  },
  computed: {
    companyId() {
      return this.$store.getters.companyId;
    },
    ifDisplayIdIsSet() {
      return this.displayId !== null || this.displayId !== undefined;
    },
  },
  watch: {
    unitId() {
      if (this.unitId) {
        this.fetchDisplays();
      }
      if (this.companyId) {
        this.fetchPlayers();
      }
    },
    //because the component is already loaded, we need to watch changes
    //for preselected display, to change the value in dropdown
    preselectedDisplayId() {
      if (this.displayOptions) {
        this.displayId = this.preselectedDisplayId;
      }
    },
  },
  mounted() {
    if (this.unitId) {
      this.fetchDisplays();
    }
    if (this.companyId) {
      this.fetchPlayers();
    }
  },
  methods: {
    onSubmit() {
      this.$emit(
        "submit",
        this.displays.filter((d) => d.id == this.displayId)[0],
        this.players.filter((p) => p.activation_code === this.playerId)[0] || {
          activation_code: this.playerId,
        }
      );
    },
    fetchPlayers() {
      if (this.companyId) {
        getPlayersOfCompany(this.companyId).then((data) => {
          this.players = data;
          this.playerOptions = data.map((e) => ({
            text: e.notes,
            value: e.activation_code,
            id: e.id,
          }));
        });
      }
    },
    fetchDisplays() {
      if (this.unitId && this.unitId !== "new") {
        getUnitDisplays(this.unitId)
          .then((data) => {
            this.displays = data;
            this.displayOptions = [
              { value: null, text: "Please select a Display" },
              ...data.map((e) => ({
                value: e.id,
                text: `${e.producer}: ${e.name} (${e.width}mm x ${e.height}mm)`,
              })),
            ];
          })
          .catch((e) => {
            this.$bvToast.toast(e.response.data.message, { variant: "danger" });
          });
      } else {
        this.displays = this.unsavedDisplays;
        this.displayOptions = [
          { value: null, text: "Please select a Display" },
          ...this.displays.map((e, index) => ({
            value: index,
            text: `${e.producer}: ${e.name} (${e.width}mm x ${e.height}mm)`,
          })),
        ];
      }
      if (this.displayOptions) {
        this.displayId = this.preselectedDisplayId;
      }
    },
  },
};
</script>
<style lang="scss">
@import "../../../assets/scss/variables";

.mo-player__arrow {
  text-align: center;
  font-size: 30px;
  color: $dark-grey;
}

.mo-player__modal {
  max-width: 750px;
}

.mo-player__form {
  max-width: 600px !important;
  width: 100%;
}
</style>
