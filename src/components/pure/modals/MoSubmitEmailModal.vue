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
      Invite user to group
    </h3>
    <form class="mt-3" @submit.prevent="onSubmit">
      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          v-model="email"
          placeholder="Email"
          type="email"
          class="mo-input"
          autocomplete="email"
          required
        ></b-form-input>
      </b-form-group>

      <mo-button title="Submit" type="submit" />
    </form>
  </b-modal>
</template>

<script>
export default {
  name: "MoSubmitEmailModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isSubmitting: false,
      email: ""
    };
  },
  methods: {
    onSubmit() {
      this.$emit("submit", this.email);
    }
  }
};
</script>
