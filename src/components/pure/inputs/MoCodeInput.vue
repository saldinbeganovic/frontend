<template>
  <div class="mo-code-input">
    <label v-for="index in codeLength" :key="index">
      <input
        ref="input"
        maxlength="1"
        autocomplete="off"
        :disabled="disabled"
        @input="onInput(index - 1, $event)"
        @keydown.delete="onDelete(index - 1)"
      />
    </label>
  </div>
</template>

<script>
export default {
  name: "MoCodeInput",
  props: {
    codeLength: {
      type: Number,
      default: 6
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      current: 0
    };
  },
  mounted() {
    // must delay the focus
    setTimeout(() => {
      this.$refs.input[this.current].focus();
    }, 100);
  },
  methods: {
    onInput(index) {
      this.$emit(
        "change",
        this.$refs.input
          .map(e => e.value)
          .join("")
          .toUpperCase()
      );
      if (this.$refs.input.length === index + 1) {
        this.$emit(
          "done",
          this.$refs.input
            .map(e => e.value)
            .join("")
            .toUpperCase()
        );
      } else {
        this.$refs.input[index + 1].focus();
      }
    },
    onDelete(index) {
      // if the current input contains non empty value,
      // delete the current input's value
      if (this.$refs.input[index].value !== "") {
        this.$refs.input[index].value = "";
      } else if (index > 0) {
        // otherwise delete the value of the previous input
        // and move (focus) to that same previous input
        this.$refs.input[index - 1].value = "";
        this.$refs.input[index - 1].focus();
      }
      this.$emit("change", this.$refs.input.map(e => e.value).join(""));
    }
  }
};
</script>
