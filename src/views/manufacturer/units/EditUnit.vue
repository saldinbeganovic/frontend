<template>
  <mo-dashboard :hide-header="true" title="Edit unit">
    <template #body>
      <validation-observer
        class="h-100 w-100"
        v-slot="{
          handleSubmit
        }"
      >
        <mo-file-modal
          modal-id="upload-pic-modal"
          api-endpoint="/api/public/units/upload"
          :body-fields="[{ key: 'type', value: 'cover' }]"
          @success-path="image = $event"
        />
        <form
          class="d-flex flex-column justify-content-between h-100 mo-public-edit-unit"
          @submit.prevent="handleSubmit(onSubmit)"
        >
          <mo-dashboard-body>
            <template #body>
              <b-col class="pb-5">
                <b-row>
                  <b-col>
                    <b-row>
                      <h5>General info</h5>
                    </b-row>
                    <b-row>
                      <b-col style="max-width: 150px" cols="4" class="mr-4">
                        <mo-image
                          :image="image"
                          :show-delete="true"
                          width="150px"
                          height="150px"
                          @edit="$bvModal.show('upload-pic-modal')"
                          @delete="image = null"
                        />
                      </b-col>
                      <b-col>
                        <b-row>
                          <b-col class="d-flex align-items-end px-1">
                            <b-form-group
                              class="w-100"
                              label="Name"
                              label-for="title"
                            >
                              <b-form-input
                                id="title"
                                v-model="title"
                                class="mo-input__light-sm"
                                placeholder="Name"
                                type="text"
                                required
                              ></b-form-input>
                            </b-form-group>
                          </b-col>
                          <b-col class="d-flex align-items-end px-1">
                            <b-form-group
                              class="w-100"
                              label="Produced by"
                              label-for="produced-by"
                            >
                              <b-form-input
                                id="produced-by"
                                v-model="producedBy"
                                class="mo-input__light-sm"
                                placeholder="Produced by"
                                type="text"
                              ></b-form-input>
                            </b-form-group>
                          </b-col>
                        </b-row>
                        <b-row class="mt-2">
                          <b-col class="px-1">
                            <b-form-group
                              class="w-100"
                              label="Length (mm)"
                              label-for="length"
                            >
                              <b-form-input
                                id="length"
                                v-model="depth"
                                class="mo-input__light-sm"
                                placeholder="Length"
                                type="number"
                                min="0"
                              ></b-form-input>
                            </b-form-group>
                          </b-col>
                          <b-col class="px-1">
                            <b-form-group
                              class="w-100"
                              label="Width (mm)"
                              label-for="width"
                            >
                              <b-form-input
                                id="width"
                                v-model="width"
                                class="mo-input__light-sm"
                                placeholder="Width"
                                type="number"
                                min="0"
                              ></b-form-input>
                            </b-form-group>
                          </b-col>
                          <b-col class="px-1">
                            <b-form-group
                              class="w-100"
                              label="Height (mm)"
                              label-for="height"
                            >
                              <b-form-input
                                id="height"
                                v-model="height"
                                class="mo-input__light-sm"
                                placeholder="Height"
                                type="number"
                                min="0"
                              ></b-form-input>
                            </b-form-group>
                          </b-col>
                          <b-col class="px-1">
                            <b-form-group
                              class="w-100"
                              label="Weight (kg)"
                              label-for="weight"
                            >
                              <b-form-input
                                id="weight"
                                v-model="weight"
                                class="mo-input__light-sm"
                                placeholder="Weight"
                                type="number"
                                min="0"
                              ></b-form-input>
                            </b-form-group>
                          </b-col>
                        </b-row>
                      </b-col>
                    </b-row>
                    <b-row class="mt-2">
                      <b-col cols="3" class="d-flex align-items-center">
                        <b-form-group class="d-flex" label="Electricity">
                          <b-form-radio-group
                            class="my-3"
                            v-model="hasElectricity"
                          >
                            <b-form-radio :value="true">Yes</b-form-radio>
                            <b-form-radio :value="false">No</b-form-radio>
                          </b-form-radio-group>
                        </b-form-group>
                      </b-col>
                      <b-col class="px-1" cols="3">
                        <b-form-group
                          class="w-100"
                          label-for="power"
                          label="Power (W)"
                        >
                          <b-form-input
                            id="power"
                            v-model="power"
                            class="mo-input__light-sm"
                            placeholder="Power (watts)"
                            type="number"
                            min="0"
                            :disabled="!hasElectricity"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                      <b-col class="px-1" cols="3">
                        <b-form-group
                          class="w-100"
                          label-for="voltage"
                          label="Voltage (V)"
                        >
                          <b-form-input
                            id="voltage"
                            v-model="voltage"
                            class="mo-input__light-sm"
                            placeholder="Voltage (V)"
                            type="number"
                            min="0"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                      <b-col cols="3" class="d-flex align-items-center">
                        <b-form-group class="d-flex" label="Illuminated">
                          <b-form-radio-group
                            class="my-3"
                            v-model="isIlluminated"
                          >
                            <b-form-radio :value="true">Yes</b-form-radio>
                            <b-form-radio :value="false">No</b-form-radio>
                          </b-form-radio-group>
                        </b-form-group>
                      </b-col>
                    </b-row>
                  </b-col>
                  <b-col>
                    <mo-collapse-section
                      :show-divider="false"
                      ref="visualsSection"
                      :is-loading="false"
                    >
                      <template #body>
                        <mo-multi-add
                          @change="visualProperties = $event"
                          add-message="Add visual property"
                          :margin="1"
                          :initial-items="visualProperties"
                        >
                          <template #item="{data, index}">
                            <b-col class="mx-2 mo-edit-unit__visual-properties">
                              <b-row>
                                <b-col class="px-1 d-flex align-items-end">
                                  <b-form-group
                                    class="w-100"
                                    :label="index === 0 ? 'Name' : null"
                                    label-for="note"
                                  >
                                    <b-form-input
                                      id="note"
                                      v-model="data.notes"
                                      class="mo-input__light-sm"
                                      placeholder="Name"
                                      type="text"
                                      :disabled="disabled"
                                    ></b-form-input>
                                  </b-form-group>
                                </b-col>
                                <b-col class="px-1 d-flex align-items-end">
                                  <b-form-group
                                    class="w-100"
                                    :label="
                                      index === 0 ? 'Property type' : null
                                    "
                                    label-for="type"
                                  >
                                    <b-form-select
                                      id="type"
                                      v-model="data.type"
                                      class="mo-input__light-sm"
                                      :options="visualTypes"
                                      :disabled="disabled"
                                      required
                                    ></b-form-select>
                                  </b-form-group>
                                </b-col>
                                <b-col class="px-1 d-flex align-items-end">
                                  <b-form-group
                                    class="w-100"
                                    :label="
                                      index === 0 ? 'Visible height (mm)' : null
                                    "
                                    label-for="visible-height"
                                  >
                                    <b-form-input
                                      id="visible-height"
                                      v-model="data.visibleHeight"
                                      class="mo-input__light-sm"
                                      placeholder="Visible height"
                                      type="number"
                                      min="0"
                                      :disabled="disabled"
                                      required
                                    ></b-form-input>
                                  </b-form-group>
                                </b-col>
                                <b-col class="px-1 d-flex align-items-end">
                                  <b-form-group
                                    class="w-100"
                                    :label="
                                      index === 0 ? 'Visible width (mm)' : null
                                    "
                                    label-for="visible-width"
                                  >
                                    <b-form-input
                                      id="visible-width"
                                      v-model="data.visibleWidth"
                                      class="mo-input__light-sm"
                                      placeholder="Visible width"
                                      type="number"
                                      min="0"
                                      :disabled="disabled"
                                      required
                                    ></b-form-input>
                                  </b-form-group>
                                </b-col>
                                <b-col class="px-1 d-flex align-items-end">
                                  <b-form-group
                                    class="w-100"
                                    :label="
                                      index === 0
                                        ? 'Printable height (mm)'
                                        : null
                                    "
                                    label-for="printable-length"
                                  >
                                    <b-form-input
                                      id="printable-length"
                                      v-model="data.printableHeight"
                                      class="mo-input__light-sm"
                                      placeholder="Printable height"
                                      type="number"
                                      min="0"
                                      :disabled="disabled"
                                      required
                                    ></b-form-input>
                                  </b-form-group>
                                </b-col>
                                <b-col class="px-1 d-flex align-items-end">
                                  <b-form-group
                                    class="w-100"
                                    :label="
                                      index === 0
                                        ? 'Printable width (mm)'
                                        : null
                                    "
                                    label-for="printable-width"
                                  >
                                    <b-form-input
                                      id="printable-width"
                                      v-model="data.printableWidth"
                                      class="mo-input__light-sm"
                                      placeholder="Printable width"
                                      type="number"
                                      min="0"
                                      :disabled="disabled"
                                      required
                                    ></b-form-input>
                                  </b-form-group>
                                </b-col>
                              </b-row>
                            </b-col>
                          </template>
                        </mo-multi-add>
                      </template>
                    </mo-collapse-section>
                  </b-col>
                </b-row>
                <b-row class="mb-2 mt-2">
                  <b-col> </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <b-row>
                      <h4>Displays</h4>
                    </b-row>
                    <b-row>
                      <mo-multi-add
                        #item="{data: display}"
                        add-message="Add display"
                        :initial-items="displays"
                        @change="displays = $event"
                        :margin="1"
                      >
                        <template>
                          <b-col>
                            <b-row>
                              <b-col>
                                <b-form-group
                                  class="w-100"
                                  label="Producer"
                                  label-for="display-producer"
                                >
                                  <b-form-input
                                    id="display-producer"
                                    v-model="display.producer"
                                    class="mo-input__light-sm"
                                    placeholder="Display producer"
                                    type="text"
                                    required
                                  ></b-form-input>
                                </b-form-group>
                              </b-col>
                              <b-col>
                                <b-form-group
                                  class="w-100"
                                  label="Name"
                                  label-for="display-name"
                                >
                                  <b-form-input
                                    id="display-name"
                                    v-model="display.name"
                                    class="mo-input__light-sm"
                                    placeholder="Display name"
                                    value="Display"
                                    required
                                  ></b-form-input>
                                </b-form-group>
                              </b-col>
                              <b-col>
                                <b-form-group
                                  class="w-100"
                                  label="Height (mm)"
                                  label-for="display-height"
                                >
                                  <b-form-input
                                    id="display-height"
                                    v-model="display.height"
                                    class="mo-input__light-sm"
                                    placeholder="Display height"
                                    type="number"
                                    required
                                  ></b-form-input>
                                </b-form-group>
                              </b-col>
                              <b-col>
                                <b-form-group
                                  class="w-100"
                                  label="Width (mm)"
                                  label-for="display-width"
                                >
                                  <b-form-input
                                    id="display-width"
                                    v-model="display.width"
                                    class="mo-input__light-sm"
                                    placeholder="Display width"
                                    type="number"
                                    required
                                  ></b-form-input>
                                </b-form-group>
                              </b-col>
                              <b-col>
                                <b-form-group
                                  class="w-100"
                                  label="Orientation (in deg)"
                                  label-for="display-orientation"
                                >
                                  <b-form-input
                                    id="display-orientation"
                                    v-model="display.orientation"
                                    class="mo-input__light-sm"
                                    placeholder="Display orientation"
                                    type="number"
                                    min="0"
                                    max="359"
                                    required
                                  ></b-form-input>
                                </b-form-group>
                              </b-col>
                            </b-row>
                          </b-col>
                        </template>
                      </mo-multi-add>
                    </b-row>
                  </b-col>
                </b-row>
                <b-row class="mb-2 mt-2">
                  <b-col> </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <b-row>
                      <h4>Images</h4>
                    </b-row>
                    <b-row>
                      <mo-multi-add
                        @change="images = $event"
                        add-message="Add image"
                        :initial-items="images"
                        :margin="1"
                        :allow-duplication="false"
                      >
                        <template #item="{data}">
                          <b-col>
                            <b-row>
                              <b-col v-if="!data.isNew" cols="8">
                                <mo-image
                                  class="w-100"
                                  :image="data.path"
                                  :container-style="{ height: '420px' }"
                                  disabled
                                />
                              </b-col>
                              <mo-upload-file
                                v-else
                                ref="uploadFileDropzone"
                                :max-files="1"
                                dropzone-id="document-dropzone"
                                title="Drag and drop to upload your image!"
                                class="mo-dropzone h-100 d-flex justify-content-center align-items-center"
                                :body-fields="[
                                  { key: 'type', value: 'images' }
                                ]"
                                :initial-files="[data]"
                                api-endpoint="/api/public/units/upload"
                                @success-path="$set(data, 'path', $event)"
                                @added-filename="$set(data, 'title', $event)"
                                :auto-process="true"
                              />
                            </b-row>
                            <b-row class="mt-3">
                              <b-col cols="4">
                                <b-form-group
                                  class="w-100"
                                  label="Title"
                                  label-for="title"
                                >
                                  <b-form-input
                                    id="title"
                                    v-model="title"
                                    class="mo-input__light-sm"
                                    placeholder="Title"
                                    type="text"
                                    required
                                  ></b-form-input>
                                </b-form-group>
                              </b-col>
                            </b-row>
                          </b-col>
                        </template>
                      </mo-multi-add>
                    </b-row>
                  </b-col>
                  <b-col>
                    <b-row>
                      <h4>Documents</h4>
                    </b-row>
                    <b-row>
                      <mo-multi-add
                        @change="documents = $event"
                        add-message="Add document"
                        :initial-items="documents"
                        :allow-duplication="false"
                        :margin="1"
                      >
                        <template #item="{data}">
                          <b-col>
                            <b-row>
                              <b-col v-if="data && !isNew" cols="8">
                                <mo-image
                                  class="w-100"
                                  :image="data.path"
                                  disabled
                                />
                              </b-col>
                              <mo-upload-file
                                v-else
                                ref="uploadFileDropzone"
                                :max-files="1"
                                accept="*"
                                dropzone-id="document-dropzone"
                                title="Drag and drop to upload your document!"
                                class="mo-dropzone h-100 d-flex justify-content-center align-items-center"
                                :body-fields="[
                                  { key: 'type', value: 'documents' }
                                ]"
                                :initial-files="[data]"
                                :clickable="true"
                                api-endpoint="/api/public/units/upload"
                                @success-path="$set(data, 'path', $event)"
                                @added-filename="$set(data, 'title', $event)"
                                :auto-process="true"
                              />
                            </b-row>
                            <b-row class="mt-3">
                              <b-col cols="8">
                                <b-form-group
                                  class="w-100"
                                  label="Title"
                                  label-for="title"
                                >
                                  <b-form-input
                                    id="title"
                                    v-model="data.title"
                                    class="mo-input__light-sm"
                                    placeholder="Description"
                                    type="text"
                                    required
                                  ></b-form-input>
                                </b-form-group>
                              </b-col>
                            </b-row>
                          </b-col>
                        </template>
                      </mo-multi-add>
                    </b-row>
                  </b-col>
                </b-row>
              </b-col>
            </template>
            <template #footer-right>
              <mo-button type="submit" title="Create" :loading="isSubmitting" />
            </template>
          </mo-dashboard-body>
        </form>
      </validation-observer>
    </template>
  </mo-dashboard>
</template>

<script>
import {
  createUnit,
  getPublicUnitMetadata,
  getUnit,
  getUnitOfManufacturer,
  updateUnit
} from "@/api/admin/company/unit/unit";
import {
  createUnitDisplay,
  updateUnitDisplay
} from "@/api/admin/company/unit/display";
import {
  createUnitVisual,
  updateUnitVisual
} from "@/api/admin/company/unit/visual";
import {
  createUnitPhoto,
  updateUnitPhoto
} from "@/api/admin/company/unit/photo";
import {
  createUnitDocumentation,
  updateUnitDocumentation
} from "@/api/admin/company/unit/documentation";

export default {
  name: "EditUnit",
  data() {
    return {
      isIlluminated: false,
      voltage: null,
      isCreated: false,
      isSubmitting: false,
      visualTypes: [],
      // general info
      image: null,
      title: "",
      brand: null,
      producedBy: "",
      height: "",
      width: "",
      depth: "",
      weight: "",
      // electricity power
      hasElectricity: false,
      power: "",
      displays: [],
      visualProperties: [],
      images: [],
      documents: []
    };
  },
  computed: {
    unitId() {
      return this.$route.params.unitId;
    },
    isNew() {
      return this.unitId === "new";
    },
    unitData() {
      return {
        title: this.title,
        cover_photo: this.image,
        brand: this.brand,
        producer: this.producedBy,
        electricity: this.hasElectricity,
        power: this.power,
        width: this.width,
        height: this.height,
        depth: this.depth,
        weight: this.weight
      };
    },
    displayData() {
      return this.displays.map(display => ({
        id: display.id,
        orientation: parseFloat(display.orientation),
        height: parseFloat(display.height),
        width: parseFloat(display.width),
        producer: display.producer,
        name: display.name
      }));
    },
    documentData() {
      return this.documents.map(doc => ({
        id: doc.id,
        path: doc.path,
        title: doc.title
      }));
    },
    imageData() {
      return this.images.map(img => ({
        id: img.id,
        path: img.path,
        title: img.title
      }));
    },
    visualData() {
      return this.visualProperties.map(vis => ({
        id: vis.id,
        visual_type_id: vis.type,
        printable_height: parseFloat(vis.printableHeight),
        visible_height: parseFloat(vis.visibleHeight),
        printable_width: parseFloat(vis.printableWidth),
        visible_width: parseFloat(vis.visibleWidth)
      }));
    }
  },
  mounted() {
    this.fetchMetaData();
    this.fetchData();
  },
  methods: {
    onSubmit() {
      const assetsWithoutPath = [
        ...this.documentData.filter(e => !e.path),
        ...this.imageData.filter(e => !e.path)
      ];
      if (assetsWithoutPath.length > 0) {
        return this.$bvToast.toast(
          "Please upload files for Images and Documents!",
          { variant: "info" }
        );
      }
      if (this.isNew) {
        this.onCreate();
      } else {
        this.onUpdate();
      }
    },
    onUpdate() {
      this.handleUpdate(
        Promise.all([
          updateUnit(this.unitId, this.unitData),
          Promise.all(
            this.displayData.map(data =>
              data.isNew
                ? createUnitDisplay(this.unitId, data)
                : updateUnitDisplay(this.unitId, data.id, data)
            )
          ),
          Promise.all(
            this.visualData.map(data =>
              data.isNew
                ? createUnitVisual(this.unitId, data)
                : updateUnitVisual(this.unitId, data.id, data)
            )
          ),
          Promise.all(
            this.imageData.map(data =>
              data.isNew
                ? createUnitPhoto(this.unitId, data)
                : updateUnitPhoto(this.unitId, data.id, data)
            )
          ),
          Promise.all(
            this.documentData.map(data =>
              data.isNew
                ? createUnitDocumentation(this.unitId, data)
                : updateUnitDocumentation(this.unitId, data.id, data)
            )
          )
        ]),
        "Unit"
      ).then(() => {
        this.$router.back();
      });
    },
    async onCreate() {
      const unit = await this.handleCreate(createUnit(this.unitData), "Unit");
      this.handleCreate(
        Promise.all([
          Promise.all(
            this.displayData.map(data => createUnitDisplay(unit.id, data))
          ),
          Promise.all(
            this.visualData.map(data => createUnitVisual(unit.id, data))
          ),
          Promise.all(
            this.imageData.map(data => createUnitPhoto(unit.id, data))
          ),
          Promise.all(
            this.documentData.map(data =>
              createUnitDocumentation(unit.id, data)
            )
          )
        ]),
        "Unit"
      ).then(() => {
        this.$router.back();
      });
    },
    fetchMetaData() {
      this.handleFetch(getPublicUnitMetadata()).then(data => {
        this.visualTypes = [
          { value: null, text: "Please select a type." },
          ...data.visual_types.map(e => ({
            value: e.id,
            text: e.name
          }))
        ];
      });
    },
    fetchData() {
      if (this.duplicateId) {
        this.handleFetch(getUnit(this.duplicateId)).then(data => {
          this.setData(data);
          this.$bvToast.toast(`Unit was duplicated, with fields prefilled.`, {
            variant: "info"
          });
        });
      }
      if (!this.isNew) {
        this.handleFetch(
          this.isManufacturerDashboard
            ? getUnitOfManufacturer(this.unitId)
            : getUnit(this.unitId)
        ).then(data => this.setData(data));
      }
    },
    setData(data) {
      this.title = data.title;
      this.disabled = !data.editable;
      this.image = data.cover_photo;
      this.brandId = data.brand_id;
      this.retailerId = data.retailer_id;
      this.height = data.height;
      this.width = data.width;
      this.weight = data.weight;
      this.depth = data.depth;
      this.hasElectricity = !!data.electricity;
      this.voltage = data.voltage;
      this.isIlluminated = !!data.is_illuminated;
      this.power = data.power;
      this.displays = data.displays;
      this.images = data.photos;
      this.documents = data.documentation;
      if (data.producer) {
        this.producedBy = data.producer;
      }
      this.visualProperties = data.visuals.map(e => ({
        id: e.id,
        type: e.type.id,
        visibleHeight: e.visible_height,
        printableHeight: e.printable_height,
        visibleWidth: e.visible_width,
        printableWidth: e.printable_width,
        note: e.notes
      }));
    }
  }
};
</script>
<style lang="scss">
.mo-public-edit-unit {
  h4 {
    margin-top: 30px;
    margin-bottom: 20px;
  }
  label,
  legend,
  input,
  select {
    font-size: 10px;
  }
}
</style>
