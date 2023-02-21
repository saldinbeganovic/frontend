<template>
  <b-modal
    :id="modalId"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body"
    dialog-class="mo-campaign-address-modal__dialog"
    hide-footer
    hide-header
    centered
  >
    <form @submit.prevent="onSubmit">
      <h3 class="text-center">Choose shipping destination</h3>
      <b-row class="w-100 mt-3">
        <hr />
        <b-form-radio v-model="selected" value="pos" name="radio-size" size="lg"
          ><b>To each Point of Sale</b></b-form-radio
        >
        <hr />
        <b-form-radio
          v-model="selected"
          class="mt-2"
          value="company"
          name="radio-size"
          size="lg"
        >
          <b class="mr-3">Company headquarters</b>
          <span>{{ companyAddress }}</span></b-form-radio
        >
        <hr />
        <b-form-radio
          v-model="selected"
          class="mt-2 mo-custom-address-radio"
          value="custom"
          name="radio-size"
          size="lg"
        >
          <b>Custom</b>
          <b-form-input
            v-model="customAddress"
            class="mo-input__light-sm ml-3"
            :disabled="selected !== 'custom'"
            placeholder="Address"
            type="text"
            required
          ></b-form-input>
        </b-form-radio>
        <hr />
      </b-row>
      <b-row class="w-100 mt-3 d-flex justify-content-around">
        <mo-button
          style="max-width: 200px"
          @click="$bvModal.hide(modalId)"
          title="Back"
        />
        <mo-button
          :disabled="selected === ''"
          style="max-width: 200px"
          type="submit"
          title="Okay"
        />
      </b-row>
    </form>
  </b-modal>
</template>

<script>
export default {
  name: "MoCampaignAddress",
  props: {
    modalId: {
      type: String,
      required: true
    },
    companyAddress: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selected: "",
      customAddress: ""
    };
  },
  methods: {
    onSubmit() {
      this.$emit("submit", this.selected, this.customAddress);
    }
  }
};
</script>
<style lang="scss">
.mo-campaign-address-modal__dialog {
  max-width: 800px;
  label {
    display: flex !important;
  }
  form {
    max-width: unset;
    b {
      font-weight: 500 !important;
    }
  }
}
</style>
