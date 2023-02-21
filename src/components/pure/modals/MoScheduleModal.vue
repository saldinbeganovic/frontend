<template>
  <b-modal
    :id="modalId"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body"
    dialog-class="mo-schedule-modal"
    hide-footer
    hide-header
    centered
  >
    <form @submit.prevent="onSubmit">
      <h4 class="text-center font-weight-light mb-5">
        When would you like to schedule these composed videos ?
      </h4>
      <b-row class="w-100">
        <b-form-group
          class="w-100"
          label="Schedule date"
          label-for="schedule-date"
        >
          <b-form-input
            id="schedule-date"
            v-model="date"
            class="mo-input__light-sm"
            type="date"
            required
          ></b-form-input>
        </b-form-group>
      </b-row>
      <b-row class="w-100">
        <b-form-group
          class="w-100"
          label="Schedule time"
          label-for="schedule-time"
        >
          <b-form-input
            id="schedule-time"
            v-model="time"
            class="mo-input__light-sm"
            type="time"
            required
          ></b-form-input>
        </b-form-group>
      </b-row>
      <b-row v-if="!validDateTime && date">
        <p class="text-danger">Selected time must not be in the past.</p></b-row
      >
      <b-row class="w-100 mt-3">
        <b-col>
          <mo-button title="Cancel" width="130px" outline @click="onCancel" />
        </b-col>
        <b-col>
          <mo-button title="Schedule" width="180px" type="submit" />
        </b-col>
      </b-row>
    </form>
  </b-modal>
</template>

<script>
export default {
  name: "MoScheduleModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  computed: {
    validDateTime() {
      const currDate = new Date();
      const providedDate = new Date(this.date);
      if (currDate.toDateString() === providedDate.toDateString()) {
        const currTime = new Date().toLocaleTimeString().slice(0, 5);
        return currTime < this.time;
      }

      return currDate < providedDate;
    }
  },
  data() {
    return {
      time: null,
      date: null
    };
  },
  methods: {
    onSubmit() {
      this.$emit("submit", new Date(`${this.time} ${this.date}`));
    },
    onCancel() {
      this.$emit("cancel");
    }
  }
};
</script>
<style lang="scss">
.mo-schedule-modal {
  max-width: 600px;
  form {
    max-width: unset;
  }
}
</style>
