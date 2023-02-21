<template>
  <b-modal
    :id="modalId"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body m-0"
    hide-footer
    hide-header
    centered
  >
    <h3 class="text-center font-weight-light mb-5">
      Please, enter your email
    </h3>
    <p class="text-center">
      A password reset email will be sent to your address after you click
      submit.
    </p>
    <form class="mt-3" @submit.prevent="$emit('submit', email)">
      <b-form-group id="input-group-4">
        <b-form-input
          id="input-2"
          v-model="email"
          placeholder="Email"
          type="email"
          class="mo-input"
          autocomplete="email"
          required
        ></b-form-input>
      </b-form-group>
      <b-button class="mo-btn" type="submit">
        Submit
      </b-button>
    </form>
  </b-modal>
</template>

<script>
export default {
  name: "MoEmailModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      email: ""
    };
  }
};
</script>
