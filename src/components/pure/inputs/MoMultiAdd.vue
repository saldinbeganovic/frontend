<template>
  <b-col class="w-100">
    <b-row v-if="itemsList.length === 0">
      <p>No items available</p>
    </b-row>
    <b-row
      v-for="(data, index) in itemsList"
      :key="index"
      :class="`d-flex mt-${margin} flex-nowrap`"
    >
      <b-col :cols="showOptionsColumn(data) ? 10 : 12">
        <b-row>
          <slot name="item" :data="data" :index="index"></slot>
        </b-row>
      </b-col>
      <b-col
        v-if="!disabled && showOptionsColumn(data)"
        cols="2"
        class="d-flex flex-row justify-content-between px-4"
      >
        <b-row
          class="justify-content-center"
          v-if="allowDeletion && (index > 0 || allowLastItemDeletion)"
        >
          <button
            v-b-tooltip.hover
            title="Delete item"
            class="mo-multi-add__delete"
            @click.prevent="onDelete(index)"
          >
            <i class="fas fa-trash" />
          </button>
        </b-row>
        <b-row class="justify-content-center" v-if="allowDuplication">
          <button
            v-b-tooltip.hover
            title="Duplicate item"
            class="mo-multi-add__duplicate"
            @click.prevent="onDuplicate(index)"
          >
            <i class="fas fa-copy" />
          </button>
        </b-row>
        <b-row class="justify-content-center" v-if="allowSave">
          <button
            v-b-tooltip.hover
            title="Save item"
            class="mo-multi-add__save"
            @click.prevent="onSave(index)"
          >
            <i class="fas fa-check" />
          </button>
        </b-row>
      </b-col>
    </b-row>
    <button
      v-if="!disabled && showAddButton"
      class="mo-multi-add__add mt-3"
      @click.prevent="onAdd"
    >
      <i class="fas fa-plus" />
      {{ addMessage }}
    </button>
  </b-col>
</template>

<script>
export default {
  name: "MoMultiAdd",
  props: {
    addMessage: {
      type: String,
      required: true
    },
    initialItems: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      default: () => []
    },
    allowSave: {
      type: Boolean,
      default: false
    },
    allowDuplication: {
      type: Boolean,
      default: true
    },
    showOptions: {
      type: [Boolean, Function],
      default: true
    },
    allowLastItemDeletion: {
      type: Boolean,
      default: true
    },
    allowDeletion: {
      type: Boolean,
      default: true
    },
    useCustomDeleteHandler: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    customOnAddHandler: {
      type: Boolean,
      default: false
    },
    showAddButton: {
      type: Boolean,
      default: true
    },
    margin: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      itemsList: this.initialItems,
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
    itemsList(value) {
      this.$emit(
        "change",
        value.filter(e => !!e && Object.keys(e).length !== 0)
      );
    },
    items(value) {
      this.itemsList = value;
    },
    // set initial when items are fetched from API
    initialItems(value) {
      if (!this.initialValuesSet) {
        this.itemsList = value;
        this.initialValuesSet = true;
      }
    }
  },
  methods: {
    onAdd() {
      if (this.customOnAddHandler) {
        this.$emit("add");
      } else {
        this.itemsList.push({
          isNew: true
        });
      }
    },
    onDelete(index) {
      if (this.useCustomDeleteHandler) {
        this.$emit("delete", this.itemsList[index].id, index);
      }
      this.itemsList.splice(index, 1);
    },
    onDuplicate(index) {
      this.itemsList.push({
        isNew: true,
        ...this.itemsList[index]
      });
    },
    onSave(index) {
      this.$emit("save", index);
    },
    showOptionsColumn(data) {
      if (typeof this.showOptions === "boolean") {
        return this.showOptions;
      }
      if (typeof this.showOptions === "function") {
        return this.showOptions(data);
      }
    }
  }
};
</script>
