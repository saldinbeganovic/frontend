<template>
  <validation-observer class="h-100 w-100" v-slot="{ handleSubmit }">
    <template v-if="!isManufacturerDashboard">
      <mo-screen-wrapper-modal ref="editMaintenanceModal" #body="{props}">
        <mo-edit-maintenance-modal
          :initial-pos-id="props.maintenancePosId"
          :initial-unit-id="props.maintenanceUnitId"
          :maintenance-id="props.maintenanceId"
        />
      </mo-screen-wrapper-modal>
      <mo-assign-warehouse-modal
        modal-id="assign-warehouse-modal"
        @submit="onAssignWarehouse"
      />
      <mo-send-docs-and-photos-modal
        ref="sendDocsAndPhotosModal"
        modal-id="send-docs-and-photos-modal"
        :unit-id="unitId"
        @done="fetchData"
        @fetch-docs="$refs.unitDocs.fetchData()"
        @fetch-images="$refs.unitImages.fetchData()"
      />
      <b-modal
      :id="modalIdName"
      hide-footer
      hide-header
      size="sm"
      centered
      body-class="mo-input-modal-body"
      dialog-class="mo-player__modal"
    >
      <h3 class="text-center font-weight-light mb-5">
        Add a new album
      </h3>
      <b-form class="mo-player__form" @submit.prevent="onSubmitAlbumUnit">
        <b-form-group label="Enter album name" label-for="name-input">
          <b-form-input v-model="albumName" placeholder="" ></b-form-input> 
        </b-form-group>
        <b-button type="submit" class="mo-btn mt-4 sbmtBtn">Submit</b-button>
      </b-form>
      
      
    </b-modal>
      <mo-player-modal
        modal-id="player-modal"
        :player="tempPlayer"
        :loading="isLoadingVideoChange"
        :is-scheduling-now="isSchedulingVideoNow"
        @change-later="onChangeVideoLater"
        @change-now="onChangeVideoNow"
      />
      <mo-change-video-modal
        v-if="!isAdminDashboard"
        ref="changeVideo"
        :current-player="tempPlayer"
        :display="tempDisplay"
        @done="onChangeVideoDone"
      />
      <mo-add-player-modal
        ref="addPlayerModal"
        modal-id="add-player-modal"
        :unit-id="unitId"
        :preselected-display-id="tempDisplayId"
        :unsavedDisplays="displays"
        @submit="onSubmitPlayer"
      />
      <mo-prompt-modal
        modal-id="connect-notice-modal"
        message="Connect player notice"
        :description="connectNoticeDescription"
        @left="$bvModal.hide('connect-notice-modal')"
        @right="onConfirmConnect"
      />
      <mo-prompt-modal
        modal-id="delete-unit-image-modal"
        message="Are you sure you want to remove this cover photo ?"
        @right="onDeleteCoverImage"
      />
      <mo-prompt-modal
        modal-id="delete-display-modal"
        message="Are you sure you want to delete this display ?"
        :no-close-on-backdrop="true"
        @right="onDeleteDisplayConfirm"
        @left="onDeleteDisplayDismiss"
      />
      <mo-prompt-modal
        modal-id="delete-visual-property-modal"
        message="Are you sure you want to delete this display ?"
        :no-close-on-backdrop="true"
        @right="onDeleteVisualConfirm"
        @left="onDeleteVisualDismiss"
      />
    </template>
    <mo-file-modal
      modal-id="upload-unit-pic-modal"
      api-endpoint="/api/units/upload"
      :body-fields="[{ key: 'type', value: 'cover' }]"
      @success="onImageUploaded"
    />
    <mo-image-gallery
      modal-id="visual-photo-modal"
      :images="[{ path: tempVisualPhotoPath }]"
    >
      <template #options>
        <i
          class="fa ml-2 fa-edit mo-image-gallery-modal__download"
          style="font-size: 20px"
          @click="onUploadVisualPhoto"
        />
      </template>
    </mo-image-gallery>
    <mo-file-modal
      modal-id="visual-photo-upload-modal"
      api-endpoint="/api/units/upload"
      :body-fields="[{ key: 'type', value: 'images' }]"
      @success-path="onUploadVisualPhotoSuccess"
    />
    <mo-assign-units-modal
      :modal-id="restoreUnitsModalId"
      :posId="posId"
      :closeOnSelect="true"
      @submit="onRestore"
    />
    <mo-prompt-modal
      modal-id="delete-player-modal"
      message="Are you sure you want to detach this player from your unit ?"
      :no-close-on-backdrop="true"
      @right="onDeletePlayerConfirm"
      @left="onDeletePlayerDismiss"
    />
    <mo-prompt-modal
      modal-id="delete-unit-modal"
      message="Are you sure you want to delete unit unit ?"
      description="Unit will still be available in 'Warehoused units' tab."
      @right="onDelete"
    />
    <mo-prompt-modal
      modal-id="hard-delete-unit-modal"
      message="Are you sure you want to permanently delete this unit ?"
      @right="onHardDelete"
    />
    <mo-image-gallery
      modal-id="cover-unit-image-modal"
      :images="[{ path: image }]"
    />
    <mo-file-modal
      modal-id="upload-document-modal"
      accept="*"
      api-endpoint="/api/units/upload"
      :body-fields="[{ key: 'type', value: 'documents' }]"
      :title.sync="tempFileTitle"
      @success-path="onUploadDocumentSuccess"
    >
      <template #body>
        <b-row class="mt-2">
          <b-form-group class="w-100" label="Title" label-for="title">
            <b-form-input
              id="title"
              v-model="currentDocument.title"
              class="mo-input__light-sm"
              placeholder="Title"
              type="text"
              required
            ></b-form-input>
          </b-form-group>
        </b-row>
      </template>
    </mo-file-modal>
    <mo-file-modal
      modal-id="upload-image-modal"
      api-endpoint="/api/units/upload"
      :body-fields="[{ key: 'type', value: 'images' }]"
      @success-path="onUploadImageSuccess"
    />
    <form
      class="d-flex flex-column justify-content-between h-100"
      @submit.prevent="handleSubmit(onSubmit)"
    >
      <mo-dashboard-body
        aligned-class="mo-edit-unit__aligned"
        :loading="isLoading"
      >
        <template #body>
          <b-col class="pb-5 mo-edit-unit">
            <b-row>
              <b-col :cols="colsGeneralInfo">
                <b-row>
                  <b-col class="text-nowrap">
                    <b-row>
                      <h5>
                        General info
                        <small v-if="posName">({{ posName }})</small>
                      </h5>
                    </b-row>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="2" class="mr-1">
                <b-row>
                  <mo-image-select
                    request-prefix="unit"
                    :main-image="image"
                    :images="imagesN"
                    :disabled="!$store.getters.hasAdminRole"
                    :show-delete="$store.getters.hasAdminRole ? true : false"
                    @image-selected="changeCoverPhoto"
                    @edit-image="$bvModal.show('upload-unit-pic-modal')"
                    @delete-image="$bvModal.show('delete-unit-image-modal')"
                    @expand-image="$bvModal.show('cover-unit-image-modal')"
                  />
                </b-row>
              </b-col>

              <b-col>
                <b-row>
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
                      <b-col class="px-1" v-if="!isArchived">
                        <b-form-group class="w-100" label-for="pos" label="PoS">
                          <b-form-select
                            v-model="selectedPoS"
                            :options="posOptions"
                            class="mo-input__light-sm"
                          >
                            <template #first>
                              <b-form-select-option :value="null" disabled
                                >Please select a PoS</b-form-select-option
                              >
                            </template>
                          </b-form-select>
                        </b-form-group>
                      </b-col>
                      <b-col class="px-1" v-else>
                        <b-form-group
                          class="w-100"
                          label-for="warehouse"
                          label="Warehouse"
                        >
                          <b-form-select
                            v-model="selectedWarehouse"
                            :options="warehouseOptions"
                            class="mo-input__light-sm"
                          >
                            <template #first>
                              <b-form-select-option :value="null" disabled
                                >Please select a warehouse</b-form-select-option
                              >
                            </template>
                          </b-form-select>
                        </b-form-group>
                      </b-col>
                    </b-row>
                    <b-row>
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

                      <b-col class="px-1">
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
                          ></b-form-input>
                        </b-form-group>
                      </b-col>

                      <b-col class="px-1">
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
                    </b-row>
                  </b-col>
                </b-row>
                <!-- VISUAL PROPERTY -->
                <b-row class="ml-2">
                  <mo-collapse-section
                    :show-divider="false"
                    ref="visualsSection"
                    :is-loading="isLoading"
                  >
                    <template #body>
                      <b-row>
                        <b-col>
                          <mo-table
                            empty-text="No visual properties"
                            table-class="mo-visual-propertie-table w-100"
                            :fields="visualPropertiesFields"
                            :items="visualProperties"
                            :loading="isLoading"
                            :show-edit-button="false"
                            :show-id-field="false"
                          >
                            <template #cell(photo)="{item,index}">
                              <b-form-group class="text-center m-auto">
                                <img
                                  v-if="item.photo"
                                  class="rounded"
                                  style="cursor: pointer; height: 40px;width: 40px"
                                  :key="index"
                                  alt=""
                                  :src="toS3Url(item.photo)"
                                  @click="onViewVisualPhoto(index)"
                                />
                                <i
                                  v-else
                                  class="fa fa-image mo-company-icon"
                                  style="font-size: 30px; cursor: pointer"
                                  @click="onUploadInitialVisualPhoto(index)"
                                />
                              </b-form-group>
                            </template>

                            <template #cell(notes)="{item}">
                              <b-form-input
                                id="visual-property-notes"
                                v-model="item.notes"
                                placeholder="Name"
                                type="text"
                                :disabled="disabled"
                                required
                              ></b-form-input>
                            </template>

                            <template #cell(type)="{item}">
                              <b-form-select
                                id="type"
                                v-model="item.type"
                                class="w-auto"
                                :options="visualTypes"
                                :disabled="disabled"
                                required
                              ></b-form-select>
                            </template>

                            <template #cell(material)="{item}">
                              <b-form-select
                                id="visual-material"
                                v-model="item.material"
                                class="w-100"
                                :options="visualMaterials"
                                :disabled="disabled"
                                required
                              ></b-form-select>
                            </template>

                            <template #cell(visibleHeight)="{item}">
                              <b-form-input
                                id="visual-property-visible-height"
                                v-model="item.visibleHeight"
                                placeholder="Visible height"
                                type="number"
                                :disabled="disabled"
                                required
                              ></b-form-input>
                            </template>

                            <template #cell(visibleWidth)="{item}">
                              <b-form-input
                                id="visual-property-visible-width"
                                v-model="item.visibleWidth"
                                placeholder="Visible width"
                                type="number"
                                :disabled="disabled"
                                required
                              ></b-form-input>
                            </template>

                            <template #cell(printableHeight)="{item}">
                              <b-form-input
                                id="visual-property-printable-height"
                                v-model="item.printableHeight"
                                placeholder="Printable height"
                                type="number"
                                :disabled="disabled"
                                required
                              ></b-form-input>
                            </template>

                            <template #cell(printableWidth)="{item}">
                              <b-form-input
                                id="visual-property-printable-width"
                                v-model="item.printableWidth"
                                placeholder="Printable width"
                                type="number"
                                :disabled="disabled"
                                required
                              ></b-form-input>
                            </template>
                            <template #cell(actions)="{item,index}">
                              <b-row
                                v-if="$store.getters.hasAdminRole"
                                class="mx-auto"
                              >
                                <b-col cols="3">
                                  <button
                                    :id="`${item.id}-delete-visual-item`"
                                    class="mo-multi-add__delete"
                                    @click.prevent="
                                      onDeleteVisual(item.id, index)
                                    "
                                  >
                                    <i class="fas fa-trash" />
                                  </button>
                                </b-col>
                                <b-col cols="3">
                                  <button
                                    :id="`${item.id}-duplicate-visual-item`"
                                    class="mo-multi-add__duplicate"
                                    @click.prevent="onDuplicateVisual(index)"
                                  >
                                    <i class="fas fa-copy" />
                                  </button>
                                </b-col>
                                <b-col cols="3">
                                  <button
                                    :id="`${item.id}-save-visual-item`"
                                    class="mo-multi-add__save"
                                    @click.prevent="onUpdateVisuals(index)"
                                  >
                                    <i class="fas fa-check" />
                                  </button>
                                </b-col>
                              </b-row>
                              <b-tooltip
                                :target="`${item.id}-save-visual-item`"
                                triggers="hover"
                              >
                                Save visual property
                              </b-tooltip>
                              <b-tooltip
                                :target="`${item.id}-delete-visual-item`"
                                triggers="hover"
                              >
                                Delete visual property
                              </b-tooltip>
                              <b-tooltip
                                :target="`${item.id}-duplicate-visual-item`"
                                triggers="hover"
                              >
                                Duplicate visual property
                              </b-tooltip>
                            </template>
                            <template #cell(comment)="{item}">
                              <b-form-textarea
                                id="visual-property-comment"
                                v-model="item.comment"
                                placeholder="Comment"
                                type="text"
                                :disabled="disabled"
                              ></b-form-textarea>
                            </template>
                          </mo-table>
                        </b-col>
                      </b-row>
                      <b-row>
                        <b-col>
                          <button
                            v-if="$store.getters.hasAdminRole"
                            class="mo-multiselect__add mt-3"
                            @click.prevent="onAddVisual"
                          >
                            <i class="fas fa-plus" />
                            Add visual property
                          </button>
                        </b-col>
                      </b-row>
                    </template>
                  </mo-collapse-section>
                </b-row>
              </b-col>
            </b-row>
            <b-row>
              <b-col class="px-0">
                <b-form-group label="Notes" label-for="notes">
                  <b-form-textarea
                    id="notes"
                    v-model="notes"
                    class="mo-input__light-sm"
                    placeholder="Notes"
                    type="text"
                    rows="3"
                  >
                  </b-form-textarea>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row class="mb-4 mt-4">
              <b-col>
                <hr />
              </b-col>
            </b-row>
            <template>
              <b-row>
                <b-col>
                  <mo-collapse-section :is-loading="isLoading" title="Albums">
                    <template #body>
                      <b-col>
                        <b-row>
                          <mo-unit-images
                            ref="unitImages"
                            :unit-id="unitId"
                            :pos-id="posId"
                            :images="images"
                            @deletedunitalbum="deleteUnitAlbum"
                            @deleted="onAlbumImageDelete"
                            @newunitimage="newimageAlbum"
                          />
                        </b-row>
                        <b-row>
                          <button
                            v-if="$store.getters.hasAdminRole"
                            class="mo-multiselect__add mt-3"
                            @click.prevent="onAddImage"
                          >
                            <i class="fas fa-plus" />
                            Add album
                          </button>
                        </b-row>
                      </b-col>
                    </template>
                  </mo-collapse-section>
                </b-col>
                <b-col>
                  <mo-collapse-section
                    :is-loading="isLoading"
                    title="Documents"
                  >
                    <template #body>
                      <b-col>
                        <b-row>
                          <mo-unit-docs
                            ref="unitDocs"
                            :unit-id="unitId"
                            :pos-id="posId"
                            :documents="tempDocuments"
                            @fetch-parent="
                              $refs.sendDocsAndPhotosModal.fetchData()
                            "
                          />
                        </b-row>
                        <b-row>
                          <button
                            v-if="$store.getters.hasAdminRole"
                            class="mo-multiselect__add mt-3"
                            @click.prevent="onAddDocument"
                          >
                            <i class="fas fa-plus" />
                            Add document
                          </button>
                        </b-row>
                      </b-col>
                    </template>
                  </mo-collapse-section>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <mo-collapse-section
                    ref="displaysSection"
                    :is-loading="isLoading"
                    title="Displays"
                  >
                    <template #body>
                      <b-col>
                        <b-row>
                          <mo-table
                            empty-text="No displays"
                            table-class="mo-display-table"
                            :fields="playerFields"
                            :items="displays"
                            :loading="isLoading"
                            :show-edit-button="false"
                            :show-id-field="false"
                          >
                            <template #cell(producer)="{item}">
                              <b-form-input
                                id="display-producer"
                                v-model="item.producer"
                                placeholder="Display producer"
                                type="text"
                                :disabled="disabled"
                                required
                              ></b-form-input>
                            </template>
                            <template #cell(name)="{item}">
                              <b-form-input
                                id="display-name"
                                v-model="item.name"
                                placeholder="Display name"
                                value="Display"
                                :disabled="disabled"
                                required
                              ></b-form-input>
                            </template>

                            <template #cell(height)="{item}">
                              <b-form-input
                                id="display-height"
                                v-model="item.height"
                                placeholder="Display height"
                                type="number"
                                :disabled="disabled"
                                required
                              ></b-form-input>
                            </template>

                            <template #cell(width)="{item}">
                              <b-form-input
                                id="display-width"
                                v-model="item.width"
                                placeholder="Display width"
                                type="number"
                                :disabled="disabled"
                                required
                              ></b-form-input>
                            </template>

                            <template #cell(orientation)="{item}">
                              <b-form-select
                                id="type"
                                class="w-auto"
                                v-model="item.orientation"
                                :options="orientationOptions"
                                :disabled="disabled"
                                required
                              ></b-form-select>
                              <i
                                :style="orientationRotation(item.orientation)"
                                class="ml-1 fas fa-tv"
                              />
                            </template>
                            <template #cell(has_daisy_chain)="{item}">
                              <b-form-checkbox
                                v-if="item"
                                v-model="item.has_daisy_chain"
                                value="1"
                                unchecked-value="0"
                              />
                            </template>

                            <template #cell(actions)="{item,index}">
                              <b-row
                                v-if="$store.getters.hasAdminRole"
                                class="mx-auto"
                              >
                                <b-col cols="3">
                                  <button
                                    :id="`${index}-delete-item`"
                                    class="mo-multi-add__delete"
                                    @click.prevent="
                                      onDeleteDisplay(item.id, index)
                                    "
                                  >
                                    <i class="fas fa-trash" />
                                  </button>
                                </b-col>
                                <b-col cols="3">
                                  <button
                                    :id="`${index}-duplicate-item`"
                                    class="mo-multi-add__duplicate"
                                    @click.prevent="onDuplicateDisplay(index)"
                                  >
                                    <i class="fas fa-copy" />
                                  </button>
                                </b-col>
                                <b-col cols="3">
                                  <button
                                    :id="`${index}-save-item`"
                                    class="mo-multi-add__save"
                                    @click.prevent="onUpdateDisplays(index)"
                                  >
                                    <i class="fas fa-check" />
                                  </button>
                                </b-col>
                               
                              </b-row>
                              <span v-if="!isNew">
                                <b-tooltip
                                  :target="`${index}-save-item`"
                                  triggers="hover"
                                >
                                  Save display
                                </b-tooltip>
                                <b-tooltip
                                  :target="`${index}-delete-item`"
                                  triggers="hover"
                                >
                                  Delete display
                                </b-tooltip>
                                <b-tooltip
                                  :target="`${index}-duplicate-item`"
                                  triggers="hover"
                                >
                                  Duplicate display
                                </b-tooltip>
                             
                              </span>
                            </template>

                            <template #cell(player-video-thumbnail)="{item}">
                              <span v-if="item.player">
                                <img
                                  v-if="item.player.video"
                                  class="mo-edit-unit__player-thumbnail"
                                  :src="toS3Url(item.player.video.thumbnail)"
                                  alt=""
                                  @click="onViewPlayer(item)"
                                />
                                <i
                                  v-else
                                  class="fas fa-film mo-edit-unit__player-thumbnail"
                                  @click="onViewPlayer(item)"
                                />
                              </span>
                              <span v-else>-</span>
                            </template>

                            <template #cell(player-state)="{item}">
                              <span
                                v-if="item.player"
                                class="px-1 d-flex align-items-center justify-content-center"
                              >
                                <div
                                  :id="`${item.id}-player-status`"
                                  :class="
                                    `mo-edit-unit__player-status ${
                                      item.player.state
                                        ? 'mo-bg__success'
                                        : 'mo-bg__danger'
                                    }`
                                  "
                                />
                                <b-tooltip
                                  :target="`${item.id}-player-status`"
                                  triggers="hover"
                                >
                                  {{ item.player.state | playerStateFilter }}
                                </b-tooltip>
                              </span>
                              <span v-else>-</span>
                            </template>
                            <template
                              #cell(player-last_log-created_at)="{item}"
                            >
                              <span v-if="item.player">
                                {{
                                  item.player.last_log
                                    ? formatDate(
                                        item.player.last_log.created_at,
                                        true,
                                        true
                                      )
                                    : "-"
                                }}
                              </span>
                              <span v-else>-</span>
                            </template>

                            <template #cell(player-activation_code)="{item}">
                              <span v-if="item.player">
                                {{ item.player.activation_code }}
                              </span>
                              <span v-else>-</span>
                            </template>
                            

                            <template #cell(player-action)="{item,index}">
                              <span
                                v-if="
                                  item.player && $store.getters.hasAdminRole
                                "
                              >
                                <b-row
                                
                                class="mx-auto"
                              >
                                <b-col cols="2">
                                  <span
                                    :id="`${item.id}-player-delete-item`"
                                  class="mo-multi-add__delete onHover"
                                  @click="onDeletePlayer(item.player.id)"

                                  >
                                    <i class="fas fa-trash" />
                                  </span>
                                </b-col>
                                 <b-col cols="2">
                                  <span
                                    :id="`${item.id}-player-screenshot-item`"
                                    class="mo-multi-add__save onHover"
                        
                                    @click="$router.push({path:`/admin/device/player/${item.player.id}#screenshots`})"
                                  >
                                    <i class="fas fa-camera" />
                                  </span>
                                </b-col>
                                <b-col cols="2">
                                  <span
                                    :id="`${item.id}-player-overview-item`"
                                    class="mo-multi-add__save onHover"
                        
                                    @click="$router.push({path:`/admin/device/player/${item.player.id}#overview`})"
                                  >
                                    <i class="fas fa-eye" />
                                  </span>
                                </b-col>
                                </b-row>
                                <b-tooltip
                                  :target="`${item.id}-player-delete-item`"
                                  triggers="hover"
                                >
                                  Delete player
                                </b-tooltip>
                                <b-tooltip
                                  :target="`${item.id}-player-screenshot-item`"
                                  triggers="hover"
                                >
                                  Screenshot player
                                </b-tooltip>
                                <b-tooltip
                                  :target="`${item.id}-player-overview-item`"
                                  triggers="hover"
                                >
                                  Overview player
                                </b-tooltip>
                              </span>
                              <span
                                v-else-if="
                                  $store.getters.hasAdminRole && item.id
                                "
                              >
                                <button
                                  :id="`${item.id}-player-add-item`"
                                  class="mo-btn__add"
                                  @click.prevent="
                                    isNew
                                      ? onConnectPlayerModalShow(index)
                                      : onConnectPlayerModalShow(item.id)
                                  "
                                >
                                  <i class="fas fa-plus" />
                                  Connect player
                                </button>
                                <b-tooltip
                                  :target="`${item.id}-player-add-item`"
                                  triggers="hover"
                                >
                                  Connect player
                                </b-tooltip>
                              </span>
                              <span v-else>-</span>
                            </template>
                          </mo-table>
                        </b-row>
                        <b-row>
                          <b-col>
                            <button
                              v-if="$store.getters.hasAdminRole"
                              class="mo-multiselect__add mt-3"
                              @click.prevent="onAddDisplay"
                            >
                              <i class="fas fa-plus" />
                              Add display
                            </button>
                          </b-col>
                        </b-row>
                      </b-col>
                    </template>
                  </mo-collapse-section>
                </b-col>
              </b-row>
              

            </template>
          </b-col>
        </template>
        <template v-if="!disabled" #footer-right>
          <mo-button
            v-if="!isNew && $store.getters.hasAdminRole"
            title="Send docs & photos"
            width="280px"
            class="mr-2"
            @click="onSendDocsAndPhotos"
          />
          <template v-if="isArchived">
            <mo-button
              v-if="$store.getters.hasAdminRole"
              variant="danger"
              title="Permanently delete"
              @click="$bvModal.show('hard-delete-unit-modal')"
            />
            <mo-button
              v-if="$store.getters.hasAdminRole"
              class="ml-2 mr-2"
              title="Restore"
              @click="$bvModal.show(restoreUnitsModalId)"
            />
          </template>
          <template v-else>
            <mo-button
              v-if="isNew"
              title="Order maintenance"
              width="285px"
              class="mr-2"
              @click="onOrderMaintenance"
            />
          
            <mo-button
              v-if="!isNew && $store.getters.hasAdminRole"
              variant="danger"
              class="mr-2"
              title="Delete"
              @click="$bvModal.show('delete-unit-modal')"
            />
          </template>
          <mo-button
            v-if="!isNew && $store.getters.hasAdminRole"
            type="submit"
            title="Update"
            :loading="isSubmitting"
          />
          <mo-button
            v-if="isNew && $store.getters.hasAdminRole"
            type="submit"
            title="Create"
            :loading="isSubmitting"
          />
        </template>
      </mo-dashboard-body>
    </form>
  </validation-observer>
</template>

<script>
import { getWarehousesOfCompany } from "@/api/user/warehouse";
import {
  archiveUnit,
  createUnit,
  deleteUnit,
  getUnit,
  getUnitMetadata,
  getUnitOfManufacturer,
  updateUnit,
  assignToSpecificPos,
} from "@/api/admin/company/unit/unit";
import {
  createUnitDisplay,
  deleteUnitDisplay,
  getUnitDisplays,
  updateUnitDisplay,
} from "@/api/admin/company/unit/display";


import {
  createUnitVisual,
  deleteUnitVisual,
  updateUnitVisual,
} from "@/api/admin/company/unit/visual";

import { createUnitPhoto } from "@/api/admin/company/unit/photo";
import { createUnitDocumentation } from "@/api/admin/company/unit/documentation";
import { getManufacturer } from "@/api/manufacturer";
import {
  activatePlayer,
  detachPlayer,
  getPlayersOfUnit,
  getPlayer,
} from "@/api/admin/device/player";
import MoAddPlayerModal from "@/components/statefull/modals/MoAddPlayerModal";
import MoUnitImages from "@/components/statefull/tables/MoUnitImages";
import MoUnitDocs from "@/components/statefull/tables/MoUnitDocs";
import MoChangeVideoModal from "@/components/statefull/modals/MoChangeVideoModal";
import MoPlayerModal from "@/components/pure/modals/MoPlayerModal";
import MoEditMaintenanceModal from "@/views/user/maintenance/EditMaintenance";
import MoAssignUnitsModal from "@/components/statefull/modals/MoAssignUnitsModal";
import MoAssignWarehouseModal from "@/components/statefull/modals/MoAssignWarehouseModal";
import MoSendDocsAndPhotosModal from "@/components/statefull/modals/MoSendDocsAndPhotosModal";
import MoImageGallery from "@/components/pure/modals/MoImageGallery";
import MoImageSelect from "@/components/pure/MoImageSelect";


export default {
  name: "EditUnit",
  props: {
    posId: {
      type: [Number, String],
      required: true,
    },
    unitId: {
      type: [Number, String],
      required: true,
    },
    duplicateUnitId: {
      type: Number,
      required: true,
    },
  },
  components: {
    MoImageGallery,
    MoSendDocsAndPhotosModal,
    MoAssignWarehouseModal,
    MoEditMaintenanceModal,
    MoPlayerModal,
    MoChangeVideoModal,
    MoUnitDocs,
    MoUnitImages,
    MoAddPlayerModal,
    MoImageSelect,
    MoAssignUnitsModal,

  },
  data() {
    return {
      tempVisualPropertyID: null,
      tempDisplayId: null,
      isLoadingVideoChange: null,
      isSchedulingVideoNow: false,
      tempPlayer: null,
      tempDisplay: null,
      currentPlayerId: null,
      currentDocument: {},
      currentImage: {},
      // send docs & photos feature
      selectedDocuments: [],
      newAlbumName: "",
      selectedImages: [],
      // visual photos feature
      tempVisualIndex: null,
      tempVisualPhotoPath: null,
      disabled: false,
      isLoading: false,
      isSubmitting: false,
      isArchived: false,
      brands: [],
      visualTypes: [],
      visualMaterials: [],
      retailers: [],
      tempDocuments: [],
      modalIdName: "album_unit_modal",
      tempFileTitle: "",
      // general info
      image: null,
      title: "",
      brandId: null,
      retailerId: null,
      producedBy: "",
      height: "",
      width: "",
      depth: "",
      weight: "",
      notes: "",
      power: "",
      displays: [],
      displayOptions: [],
      players: [],
      visualProperties: [],
  
      images: [],
      imagesN: [],
      documents: [],
      voltage: null,
      // connect player <-> display variables
      playerActivationCode: null, // temporary id of player to connect with display or video,
      playerId: null,
      displayId: null, // temporary id of display to connect with player,
      connectNoticeDescription: "",
      selectedPoS: null,
      posOptions: [],
      selectedWarehouse: null,
      warehouseOptions: [],
      posName: "",
      playerFields: [
        //DISPLAY
        {
          key: "producer",
          label: "Producer",
          sortable: false,
        },
        {
          key: "name",
          label: "Name",
          sortable: false,
        },
        {
          key: "height",
          label: "Height",
          sortable: false,
        },
        {
          key: "width",
          label: "Width",
          sortable: false,
        },
        {
          key: "orientation",
          label: "Orientation",
          sortable: false,
        },
        {
          key: "has_daisy_chain",
          label: "Daisy chain",
          sortable: false,
        },
        {
          key: "actions",
          label: "Display actions",
          sortable: false,
        },
        //PLAYER
        {
          key: "player-video-thumbnail",
          label: "Video",
          sortable: false,
        },
        {
          key: "player-state",
          label: "State",
          sortable: false,
        },
        {
          key: "player-last_log-created_at",
          label: "Last change",
          sortable: false,
        },
        {
          key: "player-activation_code",
          label: "Activation code",
          sortable: false,
        },
        {
          key: "player-action",
          label: "Player action",
          sortable: false,
        },
      ],
      visualPropertiesFields: [
        {
          key: "photo",
          label: "Photo",
          sortable: false,
        },
        {
          key: "notes",
          label: "Name",
          sortable: false,
        },
        {
          key: "type",
          label: "Property type",
          sortable: false,
        },
        {
          key: "material",
          label: "Visual material",
          sortable: false,
        },
        {
          key: "visibleHeight",
          label: "Visible height",
          sortable: false,
        },
        {
          key: "visibleWidth",
          label: "Visible width",
          sortable: false,
        },
        {
          key: "printableHeight",
          label: "Print height",
          sortable: false,
        },
        {
          key: "printableWidth",
          label: "Print width",
          sortable: false,
        },
        {
          key: "comment",
          label: "Comment",
          sortable: false,
        },

        {
          key: "actions",
          label: "",
          sortable: false,
        },
      ],
    };
  },
  computed: {
    orientationOptions() {
      return Array.from({ length: 4 }).map((_, i) => ({
        value: i * 90,
        text: `${i * 90}deg`,
      }));
    },
    isNew() {
      return this.unitId === "new";
    },
    restoreUnitsModalId() {
      return `${this.prefix}restore-units-modal`;
    },
    unitData() {
      return {
        title: this.title,
        cover_photo: this.image,
        producer: this.producedBy,
        power: parseFloat(this.power),
        width: parseFloat(this.width),
        height: parseFloat(this.height),
        depth: parseFloat(this.depth),
        weight: parseFloat(this.weight),
        voltage: parseFloat(this.voltage),
        notes: this.notes,
        point_of_sale_id: this.selectedPoS,
        warehouse_id: this.selectedWarehouse,
      };
    },
    displayData() {
      return this.displays.map((display) => ({
        id: display.id,
        orientation: parseFloat(display.orientation),
        height: parseFloat(display.height),
        width: parseFloat(display.width),
        producer: display.producer,
        name: display.name,
        has_daisy_chain: display.has_daisy_chain,
        ...display,
      }));
    },
    visualData() {
      return this.visualProperties.map((vis) => ({
        id: vis.id,
        visual_type_id: vis.type,
        material_id: vis.material,
        printable_height: parseFloat(vis.printableHeight),
        visible_height: parseFloat(vis.visibleHeight),
        printable_width: parseFloat(vis.printableWidth),
        visible_width: parseFloat(vis.visibleWidth),
        notes: vis.notes || "",
        photo: vis.photo,
        comment: vis.comment || "",
        ...vis,
      }));
    },
    companyId() {
      return this.$store.getters.companyId;
    },
    colsGeneralInfo() {
      return this.isNew ? "" : "6";
    },
  },
  mounted() {
    this.fetchData();
    this.fetchMetaData();
  },
  methods: {
    newimageAlbum(name) {
      this.newAlbumName = name;
      
    },
   onSubmitAlbumUnit(){
      let data = new FormData();
        
        data.append("name", this.albumName);
      
        
        createUnitPhoto(this.unitId, data).then(() => {
        this.albumName = "";
        this.$refs.unitImages.fetchData();
        this.$bvModal.hide(this.modalIdName);
        this.fetchData();
      });
    },
    onAlbumImageDelete(image) {
      if (this.image == image.path) {
        this.removeCoverImageAndUpdate();
      } else {
        setTimeout(() => {
        this.$refs.unitImages.fetchData();
      }, 1500);
      setTimeout(() => {
        
        this.$bvToast.toast("Image deleted", {
          title: "Success",
          variant: "success",
          solid: true,
        });
      }, 1000);
      }
    },
    changeCoverPhoto(image) {
      this.image = image.path;
    },
    onUploadVisualPhotoSuccess(path) {
      this.visualProperties[this.tempVisualIndex].photo = path;
      this.$bvModal.hide("visual-photo-upload-modal");
      this.$bvModal.hide("visual-photo-modal");
      this.onUpdateVisuals(this.tempVisualIndex);
    },
    onUploadInitialVisualPhoto(index) {
      this.tempVisualIndex = index;
      this.onUploadVisualPhoto();
    },
    onUploadVisualPhoto() {
      this.$bvModal.show("visual-photo-upload-modal");
    },
    onViewVisualPhoto(index) {
      this.tempVisualIndex = index;
      this.tempVisualPhotoPath = this.visualProperties[index].photo;
      this.$bvModal.show("visual-photo-modal");
    },
    onSendDocsAndPhotos() {
      this.$bvModal.show("send-docs-and-photos-modal");
    },
    onOrderMaintenance() {
      this.$refs.editMaintenanceModal.show({
        maintenancePosId: this.posId,
        maintenanceUnitId: this.unitId,
      });
    },
    onImageUploaded(e, response) {
      
   
      this.image = response.message;
      if (!this.isNew) {
        this.currentImage.path = response.message;
        let data = new FormData();
        data.append("name", "");
        data.append("path", this.currentImage.path);
        
        this.handleCreate(
          createUnitPhoto(this.unitId, data),
          "Image"
        ).then(() => {
          this.currentImage = {};
          this.$refs.unitImages.fetchData();
          this.handleUpdate(updateUnit(this.unitId, this.unitData), "Unit");
        });
      } else {
        this.images.push({
          id: response.message,
          path: response.message,
        });
      }
    },
    deleteUnitAlbum(){
      setTimeout(() => {
        this.$refs.unitImages.fetchData();
      }, 1500);
      setTimeout(() => {
        
        this.$bvToast.toast("Album deleted", {
          title: "Success",
          variant: "success",
          solid: true,
        });
      }, 1000);
    },
    onVisualPropertiesChange(visuals) {
      this.visualProperties = visuals;
      this.$refs.visualsSection.refresh();
    },
    videoPlayerWidth(display) {
      return this.scaledVideoPlayerDimensions(display.width, display.height)[0];
    },
    display() {
      return this.player.display;
    },
    videoPlayerHeight(display) {
      return this.scaledVideoPlayerDimensions(display.width, display.height)[1];
    },
    onHardDelete() {
      this.handleDelete(deleteUnit(this.unitId)).then(() =>
        this.$router.back()
      );
    },
    onDelete() {
      this.$bvModal.show("assign-warehouse-modal");
    },
    onAssignWarehouse(warehouseId) {
      this.handleDelete(
        archiveUnit(this.unitId, { warehouse_id: warehouseId })
      ).then(() => this.$router.back());
    },
    onRestore(posId) {
      this.handleUnarchive(
        assignToSpecificPos(this.unitId, { point_of_sale_id: posId }),
        "Unit"
      ).then(() => {
        this.$router.back();
      });
    },
    onDeletePlayer(id) {
      this.currentPlayerId = id;
      this.$bvModal.show("delete-player-modal");
    },
    onDeletePlayerConfirm() {
      if (!this.isNew) {
        this.handleDelete(detachPlayer(this.currentPlayerId)).then(() => {
          this.fetchData();
          this.$bvModal.hide("delete-player-modal");
        });
      } else {
        let tempDisplayIndex = this.findIndexOfPlayer(this.currentPlayerId);
        if (tempDisplayIndex !== -1)
          this.removePlayerFromDisplay(tempDisplayIndex);
      }
    },
    onDeletePlayerDismiss() {
      if (!this.isNew) {
        this.fetchData();
      }
    },
    findIndexOfPlayer(playerId) {
      return this.displays.findIndex((e) =>
        e.player ? e.player.id == playerId : false
      );
    },
    removePlayerFromDisplay(displayIndex) {
      //to be reactive i have to create a new display to store the new data
      //via vue $set
      let tempDisplay = this.displays[displayIndex];
      tempDisplay.player = null;
      this.$set(this.displays, displayIndex, tempDisplay);
    },
    onChangeVideoNow() {
      this.$refs.changeVideo.changeVideoNow();
      // this.fetchData();
    },
    onChangeVideoLater() {
      this.$refs.changeVideo.changeVideoLater();
      // this.fetchData();
    },
    onChangeVideoDone() {
      this.$bvModal.hide("player-modal");
      this.fetchData();
    },
    onViewPlayer(data) {
      this.tempPlayer = {
        display: {
          height: data.height,
          width: data.width,
          orientation: data.orientation,
          has_daisy_chain: data.has_daisy_chain,
        },
        ...data.player,
      };
      this.tempDisplay = data;
      this.$bvModal.show("player-modal");
    },
    onAddImage() {
      this.$bvModal.show("album_unit_modal");
    },
    onUploadImageSuccess(path) {
    
      let data = new FormData();
      data.append("name", this.newAlbumName);
      data.append("path", path);
      this.handleCreate(
        createUnitPhoto(this.unitId, data),
        "Image"
      ).then(() => {
        this.currentImage = {};
        this.$refs.unitImages.fetchData();
        this.$bvModal.hide("upload-image-modal");
        this.fetchData();
      });


    },
    onAddDocument() {
      this.$bvModal.show("upload-document-modal");
    },
    onUploadDocumentSuccess(path) {
      this.currentDocument.path = path;
      if (!this.isNew) {
        this.handleCreate(
          createUnitDocumentation(this.unitId, this.currentDocument)
        ).then(() => {
          this.currentDocument = {};
          this.$refs.unitDocs.fetchData();
          this.$refs.sendDocsAndPhotosModal.fetchData();
          this.$bvModal.hide("upload-document-modal");
        });
      } else {
        this.tempDocuments.push({
          id: path,
          path: path,
          updated_at: new Date().toISOString(),
          ...this.currentDocument,
        });
        this.currentDocument = {};
        this.$bvModal.hide("upload-document-modal");
      }
    },
    //connect player
    onConnectPlayerModalShow(displayId) {
      this.tempDisplayId = displayId;
      this.$bvModal.show("add-player-modal");
    },
    onSubmitPlayer(display, player) {
      if (display.player && player.display_id) {
        this.connectNoticeDescription = `Selected player & display are both already connected, you will overwrite this settings. Do you want to continue ?`;
      } else if (display.player) {
        this.connectNoticeDescription = `Selected display already has a player connected to it, you will overwrite this settings. Do you want to continue ?`;
      } else if (player.display_id) {
        this.connectNoticeDescription = `Selected player already has a display connected to it, you will overwrite this settings. Do you want to continue ?`;
      }
      if (display.player || player.display_id) {
        // activation will override existing player/display
        // that is already connected to this display/player
        this.playerActivationCode = player.activation_code;
        this.playerId = player.id;
        this.displayId = display.id;
        this.$bvModal.hide("add-player-modal");
        this.$bvModal.show("connect-notice-modal");
      } else {
        // no override issues, just confirm connection
        if (!this.isNew) {
          this.onActivatePlayer(player.activation_code, display.id);
        } else {
          //push player activation code to array
          this.getPlayerAndConnect(player.id, display.id);
        }
      }
    },
    onConfirmConnect() {
      if (!this.isNew) {
        this.onActivatePlayer(this.playerActivationCode, this.displayId);
      } else {
        this.getPlayerAndConnect(this.playerId, this.displayId);
      }
    },
    getPlayerAndConnect(playerId, displayIndex) {
      //remove player if there is the player already connected to this unit
      let tempDisplayIndex = this.findIndexOfPlayer(this.playerId);
      if (tempDisplayIndex !== -1)
        this.removePlayerFromDisplay(tempDisplayIndex);
      this.handleFetch(getPlayer(playerId)).then((player) => {
        this.displays[displayIndex].player = player;
        this.displays[displayIndex].player_id = player.id;
        
      });
    },
    onActivatePlayer(playerActivationCode, displayId) {
      activatePlayer(playerActivationCode, { display_id: displayId })
        .then((data) => {
          if (data.previous_display_id)
            this.$bvToast.toast(
              "Player will no longer be available for previously assigned display"
            );
          this.$bvToast.toast("Player activated!");
          this.$bvModal.hide("add-player-modal");
          this.fetchData();
        })
        .catch((e) => {
          if (e.response.status === 404) {
            this.$bvToast.toast("Invalid player code!", { variant: "danger" });
          } else {
            this.$bvToast.toast(e.response.data.message, { variant: "danger" });
          }
        });
    },
    onAddDisplay() {
      this.displays.push({
        isNew: true,
      });
      this.$refs.displaysSection.refresh();
    },
    onDisplayChange() {
      this.$refs.displaysSection.refresh();
      this.players = this.displays.map(
        (e) => this.players.filter((p) => p && p.display_id === e.id)[0]
      );
    },
    onDeleteDisplay(id, index) {
      if (id) {
        this.tempDisplayId = id;
        this.$bvModal.show("delete-display-modal");
      } else {
        this.displays.splice(index, 1);
      }
    },
    onDeleteDisplayConfirm() {
      this.handleDelete(
        deleteUnitDisplay(this.unitId, this.tempDisplayId),
        "Display"
      ).then(() => {
        this.displays.splice(
          this.displays.findIndex((e) => e.id == this.unitId),
          1
        );

        this.$refs.addPlayerModal.fetchDisplays();
      });
    },
    onDeleteDisplayDismiss() {
      //do nothing
      // this.fetchData();
    },
    onDuplicateDisplay(index) {
      this.displays.push({
        isNew: true,
        producer: this.displays[index].producer,
        name: this.displays[index].name,
        height: this.displays[index].height,
        width: this.displays[index].width,
        orientation: this.displays[index].orientation,
        has_daisy_chain: this.displays[index].has_daisy_chain,
      });
      this.$refs.displaysSection.refresh();
    },
    onDuplicateVisual(index) {
      this.visualProperties.push({
        isNew: true,
        photo: this.visualProperties[index].photo,
        notes: this.visualProperties[index].notes,
        comment: this.visualProperties[index].comment,
        type: this.visualProperties[index].type,
        material: this.visualProperties[index].material,
        visibleHeight: this.visualProperties[index].visibleHeight,
        visibleWidth: this.visualProperties[index].visibleWidth,
        printableHeight: this.visualProperties[index].printableHeight,
        printableWidth: this.visualProperties[index].printableWidth,
      });
      this.$refs.visualsSection.refresh();
    },
    onDeleteVisual(id, index) {
      if (id) {
        this.tempVisualPropertyID = id;
        this.$bvModal.show("delete-visual-property-modal");
      } else {
        this.visualProperties.splice(index, 1);
      }
    },
    onDeleteVisualConfirm() {
      this.handleDelete(
        deleteUnitVisual(this.unitId, this.tempVisualPropertyID, "Visual")
      ).then(() => this.fetchData());
    },
    onDeleteVisualDismiss() {
      this.fetchData();
    },
    onAddVisual() {
      this.visualProperties.push({
        isNew: true,
      });
      this.$refs.visualsSection.refresh();
    },
    onUpdateVisuals(index) {
      if (index !== undefined && !this.isNew) {
        const requestData = this.visualData[index];
        if (requestData.isNew) {
          this.handleCreate(
            createUnitVisual(this.unitId, requestData),
            "Visual"
          ).then((data) => {
            this.visualProperties.splice(index, 1);
            this.visualProperties.push({
              ...data,
              type: data.visual_type_id,
              material: data.material_id,
              visibleHeight: data.visible_height,
              visibleWidth: data.visible_width,
              printableHeight: data.printable_height,
              printableWidth: data.printable_width,
            });
          });
        } else {
          this.handleUpdate(
            updateUnitVisual(this.unitId, requestData.id, requestData),
            "Visual"
          );
        }
      }
    },
    async onUpdateDisplays(index) {
      if (index !== undefined && !this.isNew) {
        const requestData = this.displayData[index];
        if (requestData.isNew) {
          createUnitDisplay(this.unitId, requestData).then((data) => {
            this.displayData[index] = data;
            this.displays.splice(index, 1);
            this.displays.push(data);
            this.$refs.addPlayerModal.fetchDisplays();
          });
        } else {
          updateUnitDisplay(this.unitId, requestData.id, requestData);
        }
      }
      //if the display cannot be created jet
      else {
        await this.refreshDisplayIds(index);
        this.$refs.addPlayerModal.fetchDisplays();
      }
    },
    //function is made to help when there is a new unit being created
    //to set ID of display as index
    refreshDisplayIds(displayIndex) {
      if (displayIndex != null || displayIndex != undefined) {
        this.displays = this.displays.map((e, index) => {
          if (displayIndex == index) {
            return {
              ...e,
              id: String(index),
            };
          } else {
            return e;
          }
        });
      } else {
        this.displays = this.displays.map((e, index) => ({
          ...e,
          id: String(index),
        }));
      }
      return this.displays;
    },
    onUpdate() {
      this.handleUpdate(updateUnit(this.unitId, this.unitData), "Unit").then(
        () => {
          if (this.selectedPoS == this.posId) {
            this.fetchData();
            this.$emit("update");
          } else {
            this.posId = this.selectedPoS;
            this.$router.replace(
              `/${this.companyPathPrefix}/pos/${this.selectedPoS}?unitId=${this.unitId}`
            );
          }
        }
      );
    },
    async onCreate() {
      const unit = await this.handleCreate(createUnit(this.unitData), "Unit");
      let createdDisplays = [];
      this.handleCreate(
        Promise.all([
          Promise.all(
            this.displayData.map((data) =>
              createUnitDisplay(unit.id, data).then((data) => {
                createdDisplays.push(data);
              })
            )
          ).then(() => {
            //check for created displays if they have any player connected to them
            //if they do connect the player to created display
            Promise.all(
              this.displayData.map((data, index) => {
                if (data.player) {
                  activatePlayer(data.player.activation_code, {
                    display_id: createdDisplays[index].id,
                  });
                }
              })
            );
          }),
          Promise.all(
            this.visualData.map((data) => createUnitVisual(unit.id, data))
          ),
          Promise.all(
            this.images.map((data) => createUnitPhoto(unit.id, data))
          ),
          Promise.all(
            this.tempDocuments.map((data) =>
              createUnitDocumentation(unit.id, data)
            )
          ),
        ]),
        "Display, Visual, Image & Document"
      ).then(() => {
        if (this.selectedPoS == this.posId) {
          this.$emit("create", unit.id);
        } else {
          this.posId = this.selectedPoS;
          this.$router.replace(
            `/${this.companyPathPrefix}/pos/${this.selectedPoS}?unitId=${this.unitId}`
          );
        }
      });
    },
    onDeleteCoverImage() {
      this.$refs.unitImages.deleteByPath(this.image);
      this.removeCoverImageAndUpdate();
    },
    removeCoverImageAndUpdate() {
      this.image = null;
      if (!this.isNew) this.onUpdate();
    },
    onSubmit() {
      if (this.isNew) {
        this.onCreate();
      } else {
        this.onUpdate();
      }
    },
    fetchMetaData() {
      if (this.isManufacturerDashboard) {
        this.handleFetch(getManufacturer()).then((data) => {
          this.producedBy = data.name;
        });
      }
      this.handleFetch(getUnitMetadata(this.companyId)).then((data) => {
        this.visualTypes = data.visual_types.map((e) => ({
          value: e.id,
          text: e.name,
        }));
        this.visualMaterials = data.visual_materials.map((e) => ({
          value: e.id,
          text: e.name,
        }));
      });
    },
    fetchData() {
      //get all PoS if andin or only those which user is assinged and set current PoS from URL with this.posId
      //this will happen regardles if editing existing or adding new unit

      this.getPos().then((posData) => {
        const uniquePoS = [
          ...new Map(posData.map((item) => [item.id, item])).values(),
        ];
        this.posOptions = [
          ...uniquePoS.map((e) => ({ value: e.id, text: e.name })),
        ];
        //There is always a selected PoS
        let tempPosOption = this.posOptions.find(
          (e) => e.value == this.$route.params.posId
        );
        this.selectedPoS = tempPosOption.value;
        this.posName = tempPosOption.text;
        
      });

      if (this.duplicateUnitId) {
        this.handleFetch(getUnit(this.duplicateUnitId)).then((data) => {
          this.setData(data);
          this.$bvToast.toast(`Unit was duplicated, with fields prefilled.`, {
            variant: "info",
          });
        });
      }
      if (!this.isNew) {
        this.handleFetch(
          Promise.all([
            this.isManufacturerDashboard
              ? getUnitOfManufacturer(this.unitId)
              : getUnit(this.unitId),
            getUnitDisplays(this.unitId),
            getPlayersOfUnit(this.unitId),
       
          ])
        	).then(([unit, displays, players]) => {
          this.setData(unit);

          this.players = unit.displays.map(
            (e) => players.filter((p) => p.display_id === e.id)[0]
          );
        

          this.displayOptions = [
            { value: null, text: "Please select a Display" },
            ...displays.map((e) => ({
              value: e.id,
              text: `${e.producer} (${e.width}mm x ${e.height}mm)`,
            })),
          ];
          if (this.isArchived) {
            getWarehousesOfCompany(this.companyId).then((warehouseData) => {
              this.warehouseOptions = warehouseData.map((e) => ({
                value: e.id,
                text: e.name,
              }));
              this.selectedWarehouse = this.warehouseOptions.find(
                (e) => e.value == this.selectedWarehouse
              ).value;
            });
          }
        });
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
      this.voltage = data.voltage;
      this.power = data.power;
      this.notes = data.notes;
      this.displays = data.displays;
      this.images = data.photos;
      this.documents = data.documentation;
      this.isArchived = !!data.is_archived;
      this.selectedWarehouse = data.warehouse_id;
      if (data.producer) {
        this.producedBy = data.producer;
      }
      this.visualProperties = data.visuals.map((e) => ({
        id: e.id,
        type: e.type.id,
        material: e.material_id,
        visibleHeight: e.visible_height,
        printableHeight: e.printable_height,
        visibleWidth: e.visible_width,
        printableWidth: e.printable_width,
        notes: e.notes,
        comment: e.comment,
        photo: e.photo,
      }));
    },
    orientationRotation(rotation) {
      return {
        transform: "rotate(" + rotation + "deg)",
        transitionDuration: "2s",
      };
    },
  

  },
  filters: {
    playerStateFilter: function(value) {
      return value ? "Player is online" : "Player is offline";
    },
  },
};
</script>
<style lang="scss">
.mo-display-table {
  th {
    white-space: unset;
  }
  td {
    text-align: center;
    padding: 0.3rem 0;
  }
  .name,
  .producer {
    width: 200px;
    max-width: 200px;
  }

  .actions,
  .player-last_log-created_at,
  .player-activation_code {
    width: 150px;
    max-width: 150px;
  }
  .orientation {
    width: 170px;
    max-width: 170px;
  }
  .width,
  .height {
    max-width: 85px;
  }
  .player-video-thumbnail,
  .player-state {
    width: 70px;
  }
}
.mo-visual-propertie-table {
  overflow: hidden;
  width: 100%;
  th {
    font-size: 0.6rem;
  }

  td {
    text-align: center;
    padding: 0.3rem 0;
  }
  .printableHeight,
  .visibleWidth,
  .visibleHeight,
  .printableWidth {
    width: 80px;
    white-space: unset;
  }
  .material {
    width: 150px;
    max-width: 150px;
  }
  .notes,
  .comment {
    width: 15vw;
    min-width: 100px;
  }
  .actions {
    min-width: 150px;
  }
}
.mo-edit-unit {
  label,
  legend,
  input,
  select,
  textarea {
    font-size: 0.65rem;
  }

  &__player-status {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .onHover:hover{
    cursor: pointer;
  }
  &__player-thumbnail {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    margin-left: auto;
    margin-right: auto;
  }

  &__button {
    width: 155px !important;
    font-size: 12px;
  }

  &__visual-properties {
    // labels must be the same height, so that input fields are aligned
    label {
      align-items: flex-end;
      display: flex !important;
    }
  }
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }

  &__aligned {
    max-width: unset !important;
    padding: 0 2rem;
  }
}
</style>
