<template>
  <b-form-group class="w-100 mo-multiselect" :label="label" :label-for="id">
    <div ref="wrapper" class="mo-multiselect__items-wrapper">
      <div
        v-for="(_, index) in items"
        :key="index"
        class="d-flex mo-multiselect__item"
      >
        <b-form-select
          :id="id"
          class="mb-2 mo-input__light-sm"
          :options="options"
          :disabled="disabled"
          v-model="items[index]"
        ></b-form-select>
        <button
          :disabled="index === 0"
          class="mo-multiselect__delete"
          @click.prevent="onDelete(index)"
        >
          <i :class="`fas fa-times ${index === 0 ? 'invisible' : ''}`" />
        </button>
      </div>
    </div>
    <button class="mo-multiselect__add" @click.prevent="onAdd">
      <i class="fas fa-plus" />
      {{ addMessage }}
    </button>
  </b-form-group>
</template>

<script>
export default {
  name: "MoMultiSelect",
  props: {
    options: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    addMessage: {
      type: String,
      required: true
    },
    initialItems: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // value must be null, because null acts as a default value
      items: [null],
      initialValuesSet: false
    };
  },
  computed: {
    id() {
      return this.label.toLowerCase();
    }
  },
  watch: {
    // notify the parent when state changes happen
    items(value) {
      this.$emit(
        "change",
        value.filter(e => !!e)
      );
    },
    initialItems(value) {
      if (!this.initialValuesSet) {
        this.items = value;
        this.initialValuesSet = true;
      }
    }
  },
  methods: {
    onAdd() {
      // value must be null, because null acts as a default value
      this.items.push(null);
      this.$emit("change", this.items);
      this.$nextTick(() => {
        this.$refs.wrapper.scrollTo(0, this.$refs.wrapper.scrollHeight);
      });
    },
    onDelete(index) {
      this.items.splice(index, 1);
      this.$emit("change", this.items);
    }
  }
};
</script>
