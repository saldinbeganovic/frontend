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
    <h3 class="mb-3">Activate new modem</h3>
    <b-form class="mo-player__form" @submit.prevent="onSubmit">
      <b-form-group label="Enter modem code" label-for="modem-input">
        <mo-code-input @done="onSubmit()" @change="modemId = $event" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  name: "MoAddModemModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      modemId: null
    };
  },
  methods: {
    onSubmit() {
      this.$emit("submit", this.modemId);
    }
  }
};
</script>
<style lang="scss">
.mo-modem__modal {
  max-width: 550px;
}

.mo-modem__form {
  max-width: 300px;
  width: 100%;
}
</style>
