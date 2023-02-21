<template>
  <mo-dashboard-body>
    <template #body>
      <mo-image-gallery
        modal-id="last-campaign-image-modal"
        :images="currentCampaignPhoto"
      />
      <mo-screen-wrapper-modal ref="changeVideoWizardModal" >
        <mo-change-video-wizard
          dialog-class="mo-edit-campaign-modal__dialog"
          @close-modal="closeChangeVideoWizardModal"
        />
      </mo-screen-wrapper-modal>
      <mo-screen-wrapper-modal
        v-if="!isAdminDashboard"
        ref="editMaintenanceModal"
        #body="{props}"
      >
        <mo-edit-maintenance-modal
          :initial-pos-id="props.maintenancePosId"
          :initial-unit-id="props.maintenanceUnitId"
          :maintenance-id="props.maintenanceId"
        />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        :modal-id="deleteVisualModalId"
        :message="`Are you sure you want to delete this visual ?`"
        description="This will permanently delete this visual. Restore is not possible."
        @right="onDeleteVisualConfirm"
      />
      <mo-screen-wrapper-modal
        ref="orderPrintingModal"
        dialog-class="mo-order-decorating-modal__dialog"
        #body="{props}"
      >
        <mo-visual-order-modal
          :pos-units-visuals-object="props.posUnitsVisualsObject"
          :visuals="props.visuals"
          @done="onOrderPrintingDone"
        />
      </mo-screen-wrapper-modal>
      <mo-screen-wrapper-modal
        ref="orderDecoratingModal"
        dialog-class="mo-order-decorating-modal__dialog"
        #body="{props}"
      >
        <mo-decorating-order-modal
          :point-of-sale-id="props.pointOfSaleId"
          :campaign-id="props.campaignId"
          :visuals="props.visuals"
          :last-campaign="props.lastCampaign"
          @done="onOrderDecoratingDone"
        />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        :modal-id="deleteArchivedUnitsModalId"
        :message="`Are you sure you want to delete ${selected.length} units ?`"
        description="This will permanently delete this units. Restore is not possible."
        @right="onDelete"
      />
      <mo-assign-units-modal
        v-if="!isAdminDashboard"
        :modal-id="restoreUnitsModalId"
        :posId="tempPosId"
        message="Choose a PoS to restore this unit."
        :closeOnSelect="true"
        @submit="onRestore"
      />
      <mo-prompt-modal
        :modal-id="deleteUnitsModalId"
        :message="`Are you sure you want to delete ${selected.length} units ?`"
        @right="onDelete"
      />
      <mo-prompt-modal
        :modal-id="archiveUnitsModalId"
        :message="`Are you sure you want to archive ${selected.length} units ?`"
        @right="onArchive"
      />
      <mo-picker-modal
        label="Player"
        message="Please, choose the display with a player you would like to access"
        :modal-id="playerPickerModalId"
        :entity-items="playerOptions"
        @submit-item="onPickPlayer"
      />
      <mo-player-modal
        :modal-id="playerModalId"
        :player="currentPlayer"
        :loading="isLoadingVideoChange"
        :is-scheduling-now="isSchedulingVideoNow"
        @change-later="onChangeVideoLater"
        @change-now="onChangeVideoNow"
      />
      <mo-change-video-modal
        v-if="canLoadChangeVideoModal"
        ref="changeVideo"
        :current-player="currentPlayer"
        :display="tempDisplay"
        @done="onChangeVideoDone"
      />
      <mo-image-gallery :modal-id="galleryModalId" :images="currentImages" />
      <mo-image-gallery
        :modal-id="visualGalleryModalId"
        :images="currentVisualPhoto"
      />
      <mo-table
        id-field="unit.id"
        ref="posTable"
        empty-text="No units to show. To add new Units, you must first create a Point of Sale in order to assign them."
        :search-query="searchQuery"
        :items="filteredItem"
        :fields="fields"
        :loading="isLoading"
        :show-id-field="false"
        :show-edit-button="false"
        table-class="mo-units-table"
        @select="selected = $event"
      >
        <template #head(unit.visuals)>
          <label>
            <select v-model="visualFilter">
              <option value="">Visuals</option>
              <option v-for="value of visualOptions" :key="value" :value="value"
                >{{ value }}
              </option>
            </select>
          </label>
        </template>

        <template #cell(unit.title)="{item}">
          <router-link
            :to="`/${companyPathPrefix}/pos/${item.id}?unitId=${item.unit.id}`"
            :title="item.unit.title"
            v-if="item.unit"
            >{{ item.unit.title }}
          </router-link>
          <span v-else>-</span>
        </template>

        <template #cell(brand.name)="{item}">
          <span :title="item.brand ? item.brand.name : null">{{
            item.brand ? item.brand.name : "-"
          }}</span>
        </template>

        <template #cell(image)="{item}">
          <b-col class="mo-units-table__pos-image px-1">
            <div
              @click="onViewImage([{ path: item.image, title: null }])"
              v-if="item.image"
              style="cursor: pointer;"
            >
              <img :src="item.image ? getImageUrl(item.image) : null" alt="" />
            </div>
          </b-col>
        </template>

        <template #cell(name)="{item}">
          <b-container>
            <b-row class="justify-content-center">
              <b-col class="my-auto">
                <div
                  style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                >
                  <router-link :title="item.name" :to="`/user/pos/${item.id}`">
                    {{ item.name }}
                  </router-link>
                </div>
              </b-col>
            </b-row>
          </b-container>
        </template>

        <template #cell(unit.visuals)="{item}">
          {{ item.unit ? item.unit.visuals.length : "-" }}
        </template>

        <template #cell(units)="{item}">
          {{ item.units.length ? item.units[0]["title"] : "-" }}
          {{ item.units.length > 1 ? "...+" + item.units.length : "" }}
        </template>

        <template #cell(unit.players)="{item}">
          <div
            v-if="hasVideo(item)"
            @click="onViewPlayer(item)"
            style="cursor: pointer;"
            class="mo-units-table__video"
          >
            <img :src="getFirstVideoSrc(item)" alt="" />
            <span>{{ getTotalVideos(item) }}</span>
          </div>
          <i
            v-else-if="hasPlayer(item)"
            style="font-size: 30px; cursor: pointer;"
            class="far fa-camera-movie mo-units-table__add-video"
            @click="onViewPlayer(item)"
          >
            <i class="mo-units-table__add-video__icon far fa-plus" />
          </i>
          <span v-else>-</span>
        </template>

        <template #cell(modem_status)="{item}">
          <template>
            <span
              class="mo-units-table__status-text"
              v-if="item.active_modems === 0 && item.inactive_modems === 0"
              >0</span
            >
            <span
              v-b-tooltip.hover
              v-if="item.active_modems > 0"
              title="Active modems"
              class="mo-text__success mo-units-table__status-text"
              >{{ item.active_modems }}</span
            >
            &nbsp;
            <span
              v-b-tooltip.hover
              v-if="item.inactive_modems > 0"
              title="Inactive modems"
              class="mo-text__danger mo-units-table__status-text"
              >{{ item.inactive_modems }}</span
            >
          </template>
        </template>

        <template #cell(player_status)="{item}">
          <template v-if="item.unit">
            <span
              class="mo-units-table__status-text"
              v-if="
                item.unit.active_players === 0 &&
                  item.unit.inactive_players === 0
              "
            >
              0
            </span>
            <span
              v-b-tooltip.hover
              title="Active players"
              v-if="item.unit.active_players > 0"
              class="mo-text__success mo-units-table__status-text"
              >{{ item.unit.active_players }}</span
            >
            &nbsp;
            <span
              v-b-tooltip.hover
              title="Inactive players"
              class="mo-text__danger mo-units-table__status-text"
              v-if="item.unit.inactive_players > 0"
              >{{ item.unit.inactive_players }}</span
            >
          </template>
          <span class="mo-units-table__status-text" v-else>
            0
          </span>
        </template>
        <template #cell(pos_player_status)="{item}">
          <template v-if="item">
            <span
              class="mo-units-table__status-text"
              v-if="item.active_players === 0 && item.inactive_players === 0"
            >
              0
            </span>
            <span
              v-b-tooltip.hover
              title="Active players"
              v-if="item.active_players > 0"
              class="mo-text__success mo-units-table__status-text"
              >{{ item.active_players }}</span
            >
            &nbsp;
            <span
              v-b-tooltip.hover
              title="Inactive players"
              class="mo-text__danger mo-units-table__status-text"
              v-if="item.inactive_players > 0"
              >{{ item.inactive_players }}</span
            >
          </template>
          <span class="mo-units-table__status-text" v-else>
            0
          </span>
        </template>

        <template #cell(gallery)="{item}">
          <div
            v-if="item.unit && getUnitImages(item)[0]"
            @click="onViewImage(getUnitImages(item))"
            style="cursor: pointer;"
            class="mo-units-table__video"
          >
            <img
              :src="
                getUnitImages(item)[0]
                  ? getImageUrl(getUnitImages(item)[0].path)
                  : null
              "
              alt=""
            />
            <span v-if="getUnitImages(item).length > 1"
              >+{{ getUnitImages(item).length - 1 }}</span
            >
          </div>
          <span v-else>-</span>
        </template>

        <template #row-details="unitRow">
          <b-card>
            <b-row class="justify-content-end">
              <mo-table
                :fields="visualFields"
                table-class="mo-pos-and-units-visuals-table"
                :filter-values="{ 'type.name': visualFilter }"
                :items="unitRow.item.unit.visuals"
                :show-id-field="false"
                :show-edit-button="false"
                :fixed="true"
                @select="
                  setSelectedVisuals(
                    unitRow.item.id,
                    unitRow.item.unit.id,
                    $event,
                    unitRow.item.unit.visuals
                  )
                "
              >
                <!-- unitRow.item.unit.id, unitRow.item.id -->
                <template #cell(photo)="{item}">
                  <img
                    v-if="item.photo"
                    class="rounded"
                    style="height: 40px;width: 40px; cursor: pointer;"
                    alt=""
                    :src="toS3Url(item.photo)"
                    @click="onViewVisualImage(item.photo)"
                  />
                  <i
                    v-else
                    class="fa fa-image mo-company-icon"
                    style="font-size: 30px;"
                  />
                </template>
                <template #cell(last_campaign.title)="{item}">
                  <div
                    class="d-flex justify-content-start"
                    v-if="item.last_campaign"
                  >
                    <a @click.self="onOrderDecorating(unitRow.item.id, item)">
                      <img
                        style="cursor: pointer"
                        class="mx-1"
                        v-if="
                          isImage(
                            item.last_campaign.visual_campaign.cover_photo
                          )
                        "
                        :src="
                          toS3Url(
                            item.last_campaign.visual_campaign.cover_photo
                          )
                        "
                        alt="Campaign cover photo"
                        @click.stop="
                          onShowCampaignPhoto(
                            item.last_campaign.visual_campaign.cover_photo
                          )
                        "
                      />
                      {{ item.last_campaign.visual_campaign.title }}
                    </a>
                  </div>
                </template>

                <template #options="visualRow">
                  <b-button
                    class="mo-table__edit"
                    title="Expand view"
                    @click="
                      onDeleteVisual(unitRow.item.unit.id, visualRow.item.id)
                    "
                  >
                    <i class="far fa-trash" />
                  </b-button>
                </template>
              </mo-table>
            </b-row>
            <b-row
              v-if="
                selectedVisuals[unitRow.item.unit.id] &&
                  selectedVisuals[unitRow.item.unit.id].length > 0
              "
              class="mt-3"
            >
            </b-row>
          </b-card>
        </template>

        <template #options="row">
          <b-button
            v-if="row.item.unit.visuals.length !== 0"
            class="mo-table__edit"
            title="Expand view"
            @click="toggleDetail(row)"
          >
            <i
              :class="
                `far ${
                  row.detailsShowing
                    ? 'fa-compress-arrows-alt'
                    : 'fa-expand-arrows'
                }`
              "
            />
          </b-button>
          <b-button
            v-if="isArchive && $store.getters.hasAdminRole"
            class="mo-table__edit"
            title="Restore unit"
            @click="onRestoreAchievedUnits(row.item.id, row.item.unit.id)"
          >
            <i class="fas fa-recycle"></i>
          </b-button>

          <b-button
            v-if="row.item.unit"
            class="mo-table__edit"
            title="Order maintenance"
            width="285px"
            @click="onCreateMaintenance(row.item.id, row.item.unit.id)"
          >
            <i class="far fa-tools" />
          </b-button>
        </template>
      </mo-table>
    </template>
    <template #footer-left>
      <mo-button
        v-if="!isArchive && $store.getters.hasAdminRole"
        @click="$router.push(`/user/pos/new`)"
        title="Add PoS"
        class="mr-2"
      />

      <select class="customSelect mr-2"   v-model="brandSelect">
            <option selected :value="undefined">Brand</option>
            <option v-for="item in uniqueBrand" :key="item">{{ item}}</option>
            </select>
            
            <select class="customSelect mr-2" @change="filter = $emit" v-model="retailerSelect">
            <option selected :value="undefined">Retailer</option>
            <option v-for="retailer in uniqueRetailer"  :key="retailer">{{ retailer}}</option>
            </select>

            <select class="customSelect mr-2"   v-model="citySelect">
            <option selected :value="undefined">City</option>
            <option v-for="item in uniqueCity" :key="item">{{ item}}</option>
            </select>

            <select class="customSelect mr-2"   v-model="countrySelect">
            <option selected :value="undefined">Country</option>
            <option v-for="item in uniqueCountry" :key="item">{{ item}}</option>
            </select>


          
      <template v-if="selected.length > 0 && canDelete">
        <mo-button
          title="Delete permanently"
          width="290px"
          variant="danger"
          v-if="$store.getters.hasAdminRole"
          @click="$bvModal.show(deleteArchivedUnitsModalId)"
        />
      </template>
    </template>
    <template #footer-right>
     
      <mo-button
        v-if="checkIfVisualsSelected && $store.getters.hasAdminRole"
        class="ml-2 mo-btn__inverted"
        title="Order Printing the Visuals"
        width="400px"
        @click="onOrderPrinting"
      />

      <template v-if="!isArchive">
        <mo-button
          v-if="numberOfDetailsOpen === 0"
          title="VISUALS/OPEN EXTENDED VIEW"
          width="440px"
          :disabled="withoutUnits"
          class="ml-2"
          @click="toggleAllDetails(true)"
        />
        <mo-button
          v-else
          title="VISUALS/CLOSE EXTENDED VIEW"
          width="440px"
          class="ml-2"
          :disabled="withoutUnits"
          @click="toggleAllDetails(false)"
        />
        <mo-button
          v-if="!withoutUnits"
          title="Show PoS Only"
          class="ml-2"
          @click="onShowPosOnlyToggle"
        />
        <mo-button
          v-else
          title="Show PoS with units"
          width="300px"
          class="ml-2"
          @click="onShowPosOnlyToggle"
        />
      </template>
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  archiveUnit,
  assignToPos,
  deleteUnit,
  getPosUnits,
  getPosUnitsOfCompany,
  unarchiveUnit,
  assignToSpecificPos,
} from "@/api/admin/company/unit/unit";
import MoPickerModal from "@/components/pure/modals/MoPickerModal";
import MoPlayerModal from "@/components/pure/modals/MoPlayerModal";
import MoImageGallery from "@/components/pure/modals/MoImageGallery";
import MoChangeVideoModal from "@/components/statefull/modals/MoChangeVideoModal";
import MoEditMaintenanceModal from "@/views/user/maintenance/EditMaintenance";
import { deleteUnitVisual } from "@/api/admin/company/unit/visual";
import MoVisualOrderModal from "@/components/statefull/modals/MoVisualOrderModal";
import MoDecoratingOrderModal from "@/components/statefull/modals/MoDecoratingOrderModal";
import MoChangeVideoWizard from "@/views/shared/units/mo-change-video-wizard/index";

import MoAssignUnitsModal from "@/components/statefull/modals/MoAssignUnitsModal";

export default {
  name: "Units",
  components: {
    MoDecoratingOrderModal,
    MoVisualOrderModal,
    MoEditMaintenanceModal,
    MoChangeVideoModal,
    MoImageGallery,
    MoPlayerModal,
    MoPickerModal,
    MoChangeVideoWizard,
    MoAssignUnitsModal,
  },
  props: {
    searchQuery: {
      type: String,
      required: true,
    },
    isArchive: {
      type: Boolean,
      default: false,
    },
  
  },
  data() {
    return {
      visualFilter: "",
      // temporary info used in modals
      tempUnitId: null,
      tempPosId: null,
      tempVisualId: null,
      currentImagePath: null,
      currentVideoPath: null,
      currentPlayer: null,
      currentCampaignPhoto: [],
      currentImages: [],
      currentVisualPhoto: [],
      playerOptions: [],
      withoutUnits: false,
      isSchedulingVideoNow: false,
      isLoadingVideoChange: false,
      dateTime: null,
      tempDisplay: null,   
      filter: null,
      isLoading: true,
      selected: [],
      selectedUnitId: null,
      items: [],
      items2: [],
      tempItems: [],
      // mapping of selected visuals for a given unit
      // [unitId] => [vid1, vid2, vid3,..]
      selectedVisuals: {},
      selectedVisualsTemp: [],
      numberOfDetailsOpen: 0,
      
      brandSelect:undefined,
      citySelect:undefined,
      countrySelect:undefined,
      retailerSelect:undefined,
     
      visualFields: [
        {
          key: "select",
        },
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
          key: "type.name",
          label: "Type",
          filterable: false,
          sortable: false,
        },
        {
          key: "material.name",
          label: "Material",
          sortable: false,
        },
        {
          key: "visible_width",
          label: "Visible width",
          sortable: false,
        },
        {
          key: "visible_height",
          label: "Visible height",
          sortable: false,
        },
        {
          key: "printable_width",
          label: "Printable width",
          sortable: false,
        },
        {
          key: "printable_height",
          label: "Printable height",
          sortable: false,
        },
        {
          key: "last_campaign.title",
          label: "Last visual roll-out",
          sortable: false,
        },
      ],
      fieldsTemp: [],
      fields: [
        {
          key: "brand.name",
          label: "Brand",
          filterable: false,
          collapsable: true,
          formatter: (value) => value || "-",
        },
        {
          key: "retailer.name",
          label: "Retailer",
          filterable: false,
          collapsable: true,
          formatter: (value) => value || "-",
        },
        {
          key: "city",
          label: "City",
          sortable: true,
          filterable: false,
          collapsable: true,
          formatter: (value) => value || "-",
        },
        {
          key: "country.name",
          label: "Country",
          sortable: true,
          filterable: false,
          collapsable: true,
          formatter: (value) => value || "-",
        },
        { key: "image", label: "" },
        {
          key: "name",
          label: "PoS",
          filterable: true,
        },
        { key: "gallery", label: "Photos", sortable: false },
        { key: "unit.id", label: "ID" },
        { key: "unit.title", label: "Unit" },
        { key: "unit.visuals", label: "Visuals" },
        { key: "modem_status", label: "Modem", sortable: false },
        { key: "player_status", label: "Player", sortable: false },

        {
          key: "unit.players",
          label: "Video",
          sortable: true,
          sortByFormatter: true,
          formatter: (value) => value && value.filter((e) => !!e.video).length,
        },
        { key: "options", label: "Tools" },
      ],
      fieldsPosOnly: [
        {
          key: "brand.name",
          label: "Brand",
          filterable: false,
          collapsable: true,
          formatter: (value) => value || "-",
        },
        {
          key: "retailer.name",
          label: "Retailer",
          filterable: false,
          collapsable: true,
          formatter: (value) => value || "-",
        },
        {
          key: "city",
          label: "City",
          sortable: true,
          filterable: false,
          collapsable: true,
          formatter: (value) => value || "-",
        },
        {
          key: "country.name",
          label: "Country",
          sortable: true,
          filterable: false,
          collapsable: true,
          formatter: (value) => value || "-",
        },
        { key: "id", label: "ID" },
        { key: "image", label: "" },
        {
          key: "name",
          label: "PoS",
          filterable: true,
        },
        { key: "modem_status", label: "Modem", sortable: false },
        { key: "pos_player_status", label: "Player", sortable: false },
        { key: "units", label: "Units", sortable: false },
      ],
    };
  },
  computed: {

     filteredItem() {
     
      //return this.items.brand.name.filter(this.brandSelect);
      return this.items.filter(item => {
        let keep = true;
        
        // This is a basic equality filter. What I did in the actual code was to have an object with filter functions for each key. If a key was missing, it defaulted to straight equality.
        
         
              if(item.brand!=null){
              keep = keep &&
            (this.brandSelect === undefined ||  item.brand.name === this.brandSelect );
            }else{
              keep = keep &&
            (this.brandSelect === undefined );
            }
              
            if(item.retailer!=null){
              keep = keep &&
            (this.retailerSelect === undefined ||  item.retailer.name === this.retailerSelect );
            }else{
              keep = keep &&
            (this.retailerSelect === undefined );
            }
           
              
              
              if(item.city!=null){
              keep = keep &&
            (this.citySelect === undefined ||  item.city === this.citySelect );
            }else{
              keep = keep &&
            (this.citySelect === undefined );
            }
           
              if(item.country!=null){
              keep = keep &&
            (this.countrySelect === undefined ||  item.country.name === this.countrySelect );
            }else{
              keep = keep &&
            (this.countrySelect === undefined );
            }
        return keep;
      });
      /*return this.brandSelect
				? this.items.filter(item => item.brand.name.includes(this.brandSelect) )
				: this.items*/
    },
    
    uniqueCountry: function() {
      var filtered_array = [];
      for(var i =0; i < this.items2.length; i++) {
        if(this.items2[i].country != null){
        if(filtered_array.indexOf(this.items2[i].country.name) === -1) {
          filtered_array.push(this.items2[i].country.name)
        }}
      }
      return filtered_array.sort()
      .filter(
      (filtered_array, i, arr) =>
        arr.indexOf(filtered_array) === i
    );
   
    },
    uniqueCity: function() {
      var filtered_array = [];
      for(var i =0; i < this.items2.length; i++) {
        if(this.items2[i].city != null){
        if(filtered_array.indexOf(this.items2[i].city) === -1) {
          filtered_array.push(this.items2[i].city)
        }}
      }
      return filtered_array.sort()
      .filter(
      (filtered_array, i, arr) =>
        arr.indexOf(filtered_array) === i
    );
    },
    uniqueBrand: function() {
      var filtered_array = [];
      for(var i =0; i < this.items2.length; i++) {
        if(this.items2[i].brand != null){
        if(filtered_array.indexOf(this.items2[i].brand.name) === -1) {
          filtered_array.push(this.items2[i].brand.name)
        }}
      }
      return filtered_array.sort()
      .filter(
      (filtered_array, i, arr) =>
        arr.indexOf(filtered_array) === i
    );
    },
    uniqueRetailer: function() {
      var filtered_array = [];
      
      for(var i =0; i < this.items2.length; i++) {
        if(this.items2[i].retailer != null){
        if(filtered_array.indexOf(this.items2[i].retailer.name) === -1) {
          
          filtered_array.push(this.items2[i].retailer.name)
          
        }
      }
    }
    return filtered_array.sort()
      .filter(
      (filtered_array, i, arr) =>
        arr.indexOf(filtered_array) === i
    );
    },
    visualOptions() {
      return [
        ...new Set(
          this.items
            .map((e) => (e.unit ? e.unit.visuals.map((e) => e.type.name) : []))
            .flat()
        ),
      ];
    },
    prefix() {
      return this.isArchive ? "archive_" : "";
    },
    visualGalleryModalId() {
      return `${this.prefix}visual-gallery-modal`;
    },
    galleryModalId() {
      return `${this.prefix}gallery-modal`;
    },
    playerModalId() {
      return `${this.isArchive}player-modal`;
    },
    archiveUnitsModalId() {
      return `${this.prefix}archive-units-modal`;
    },
    deleteUnitsModalId() {
      return `${this.prefix}delete-units-modal`;
    },
    restoreUnitsModalId() {
      return `${this.prefix}restore-units-modal`;
    },
    assignArchivedUnitsModalId() {
      return `${this.prefix}assign-units-modal`;
    },
    deleteVisualModalId() {
      return `${this.prefix}delete-visual-modal`;
    },
    deleteArchivedUnitsModalId() {
      return `${this.prefix}delete-archived-units-modal`;
    },
    unitsPosAssignModalId() {
      return `${this.prefix}units-pos-assign-unit-modal`;
    },
    playerPickerModalId() {
      return `${this.prefix}player-picker-modal`;
    },
    canDelete() {
      return this.$store.getters.hasAdminRole;
    },
    canCrudAll() {
      return this.$store.getters.hasAdminRole;
    },
    getPosRequestData() {
      return {
        is_archived: this.isArchive ? 1 : 0,
        without_units: this.withoutUnits ? 1 : 0,
      };
    },
    checkIfVisualsSelected() {
      var returnTemp = false;
      if (this.selectedVisuals) {
        Object.values(this.selectedVisuals).forEach(function(unit) {
          Object.values(unit).forEach(function(value) {
            if (value.length > 0) returnTemp = true;
          });
        });
      }
      return returnTemp;
    },
    canLoadChangeVideoModal() {
      return !this.isAdminDashboard && this.tempDisplay;
    },
  },
  watch: {
    visualFilter(value) {
      
      if (value) {
        this.toggleAllDetails(true);
      } else {
        this.toggleAllDetails(false);
      }
    },
  },
  mounted() {
    if (this.isArchive) {
      this.fields = [
        {
          key: "select",
        },
        ...this.fields.slice(0, this.fields.length - 2),
        {
          key: "unit.warehouse.name",
          label: "Warehouse",
        },
        this.fields[this.fields.length - 1],
      ];
      //To remove columns which are not neccesary
      var removeIndexFromTable = [2, 3, 4, 6, 7];
      for (var i = removeIndexFromTable.length - 1; i >= 0; i--)
        this.fields.splice(removeIndexFromTable[i], 1);
    }
    this.fetchData();
    this.fetchData2();
  },
  methods: {
    onShowCampaignPhoto(path) {
      this.currentCampaignPhoto = [{ path }];
      this.$bvModal.show("last-campaign-image-modal");
    },
    async toggleAllDetails(show = true) {
      if (show) {
        await this.fetchData();
        await this.fetchData2();
        this.tempItems = this.items;
        this.items = this.items
          .filter(
            (e) =>
              e.unit &&
              e.unit.visuals.filter((row) =>
                this.tableRowFilterFunction(row, {
                  "type.name": this.visualFilter,
                })
              ).length > 0
          )
          .map((e) => ({ ...e, _showDetails: true }));
        this.numberOfDetailsOpen = this.items.length;
      } else {
        this.items = this.tempItems.map((e) => ({ ...e, _showDetails: false }));
        this.numberOfDetailsOpen = 0;
        this.selectedVisuals = {};
      }
    },
    //toggle detail keeps numberOfDetailsOpen counter in tact and opens row detail
    toggleDetail(row) {
      row.detailsShowing
        ? this.numberOfDetailsOpen--
        : this.numberOfDetailsOpen++;
      row.toggleDetails();
    },
    onDeleteVisual(unitId, visualId) {
      this.tempUnitId = unitId;
      this.tempVisualId = visualId;
      this.$bvModal.show(this.deleteVisualModalId);
    },
    onDeleteVisualConfirm() {
      this.handleDelete(
        deleteUnitVisual(this.tempUnitId, this.tempVisualId)
      ).then(() => {
        this.fetchData();
        this.fetchData2();
        this.$bvModal.hide(this.deleteVisualModalId);
      });
    },
    onCreateMaintenance(posId, unitId) {
      if (this.isAdminDashboard) {
        return this.$bvToast.toast(
          "Can't order maintenance from admin dashboard. Please switch to the corresponding group dashboard.",
          { variant: "info" }
        );
      }
      this.$refs.editMaintenanceModal.show({
        maintenancePosId: posId,
        maintenanceUnitId: unitId,
      });
    },
    onRestoreAchievedUnits(posId, unitId) {
      // show MoAssignUnitsModal to restore unit to selected pos
      this.tempUnitId = unitId;
      this.tempPosId = posId;
      this.$bvModal.show(this.restoreUnitsModalId);
    },
    videoPlayerWidth() {
      return 700;
    },
    videoPlayerHeight(display) {
      return (display.height / display.width) * 700;
    },

    onChangeVideoDone() {
      this.fetchData();
      this.fetchData2();
      this.$bvModal.hide(this.playerModalId);
    },
    onChangeVideoNow() {
      this.$refs.changeVideo.changeVideoNow();
    },
    onChangeVideoLater() {
      this.$refs.changeVideo.changeVideoLater();
    },
    hasVideo(item) {
      const player = item.unit && item.unit.players.filter((e) => !!e.video)[0];
      return player && player.video && player.video.thumbnail;
    },
    hasPlayer(item) {
      return item.unit && item.unit.players.length > 0;
    },
    onViewPlayer(item) {
      if (!item.unit) {
        return this.$bvToast.toast("Please assign a unit to this PoS!", {
          variant: "info",
        });
      }
      const nPlayers = item.unit.players.length;
      if (nPlayers > 1) {
        this.playerOptions = item.unit.players.map((e) => ({
          value: e.id,
          text: `${
            e.display ? e.display.producer + " - " + e.display.name : ""
          }`,
          data: e,
        }));
        this.$bvModal.show(this.playerPickerModalId);
      } else if (nPlayers === 1) {
        this.currentPlayer = item.unit.players[0];
        this.tempDisplay = item.unit.players[0].display;
        this.$bvModal.show(this.playerModalId);
      } else {
        this.$bvToast.toast(
          "Please assign a player to this unit, before editing it's video!",
          { variant: "info" }
        );
      }
    },
    // called if a unit has more than a single player
    onPickPlayer(playerItem) {
      this.currentPlayer = playerItem.data;
      this.tempDisplay = playerItem.data.display;
      this.$bvModal.hide(this.playerPickerModalId);
      this.$bvModal.show(this.playerModalId);
    },
    getTotalVideos(item) {
      const total = item.unit.players.length;
      return total === 1 ? "" : `+${total - 1}`;
    },
    getFirstVideoSrc(item) {
      const player = item.unit && item.unit.players.filter((e) => !!e.video)[0];
      return (
        player &&
        player.video &&
        `${process.env.VUE_APP_S3_HOST}/${player.video.thumbnail}`
      );
    },
    getUnitImages(item) {
      return [
        { path: item.unit.cover_photo, title: null },
        ...item.unit.photos,
      ].filter((e) => e.path);
    },
    onViewVisualImage(path) {
      this.currentVisualPhoto = [{ path }];
      this.$bvModal.show(this.visualGalleryModalId);
    },
    onViewImage(photos, unitId) {
      this.currentImages = photos;
      this.currentUnitId = unitId;
      this.$bvModal.show(this.galleryModalId);
    },
    onArchive() {
      this.$bvModal.hide(this.archiveUnitsModalId);
      this.handleMultipleArchive(
        this.selected.map((id) => archiveUnit(id)),
        "Units"
      ).then(() => {
        this.$emit("refetch");
      });
    },
    fetchData() {
      return this.handleFetch(
        this.isAdminDashboard
          ? getPosUnits(this.getPosRequestData)
          : getPosUnitsOfCompany(this.companyId, this.getPosRequestData)
      ).then((data) => {
        this.items = data.map((e) => ({ ...e, _showDetails: false }));
      });
    },
    fetchData2() {
      return this.handleFetch(
        this.isAdminDashboard
          ? getPosUnits(this.getPosRequestData)
          : getPosUnitsOfCompany(this.companyId, this.getPosRequestData)
      ).then((data) => {
        this.items2 = data.map((e) => ({ ...e, _showDetails: false }));
      });
    },
    getImageUrl(path) {
      return path ? `${process.env.VUE_APP_S3_HOST}/${path}` : null;
    },
    onConfirmSingleDelete() {
      this.handleDelete(deleteUnit(this.selectedUnitId), "Unit").then(() =>
        this.fetchData()
        
      );
      this.selectedUnitId = null;
    },
    onAssignToPos(item) {
      if (this.isAdminDashboard) {
        return this.$bvToast.toast(
          "Can't order assign units from admin dashboard. Please switch to the corresponding group dashboard.",
          { variant: "info" }
        );
      }
      this.currentUnitId = item.id;
      this.$bvModal.show(this.unitsPosAssignModalId);
    },
    onSubmitAssign(posId) {
      this.handleFetch(
        assignToPos({
          point_of_sale_id: posId,
          units: [this.currentUnitId],
        })
      ).then(() => {
        this.fetchData();
        this.fetchData2();
        this.$bvModal.hide(this.unitsPosAssignModalId);
        this.$bvToast.toast(`Assigned unit to PoS!`);
      });
    },
    onRestore(posId) {
      this.handleUnarchive(
        assignToSpecificPos(this.tempUnitId, { point_of_sale_id: posId })
      ).then(() => {
        this.$bvModal.hide(this.restoreUnitsModalId);
        this.$emit("refetch");
      });
    },
    onAssignArchivedUnits() {
      this.handleMultipleArchive(
        this.selected.map((id) => unarchiveUnit(id)),
        "Units"
      ).then(() => {
        this.$emit("refetch");
      });
    },
    onDelete() {
      this.$bvModal.hide(this.deleteArchivedUnitsModalId);
      this.handleMultipleDelete(
        this.selected.map((id) => deleteUnit(id)),
        "Units"
      );
    },
    onOrderPrinting() {
      let tempArr = this.selectedVisualsTemp.flat();
      this.$refs.orderPrintingModal.show({
        posUnitsVisualsObject: this.selectedVisuals,
        visuals: tempArr,
      });
    },
    onOrderDecorating(posId, item) {
      if (this.canCrudAll)
        this.$refs.orderDecoratingModal.show({
          pointOfSaleId: posId,
          campaignId: item.last_campaign.visual_campaign.id,
          visuals: item.last_campaign.visuals,
          lastCampaign: item.last_campaign,
        });
    },
    onOrderPrintingDone() {
      this.$refs.orderPrintingModal.hide();
      this.selectedVisuals = {};
      this.fetchData();
      this.fetchData2();
    },
    onOrderDecoratingDone() {
      this.$refs.orderDecoratingModal.hide();
    },
    onShowPosOnlyToggle() {
      this.withoutUnits = !this.withoutUnits;
      if (this.withoutUnits) {
        this.fieldsTemp = this.fields;
        this.fields = this.fieldsPosOnly;
      } else {
        this.fields = this.fieldsTemp;
      }
      this.fetchData();
      this.fetchData2();
    },
    setSelectedVisuals(posId, unitId, visuals, test) {
      this.selectedVisualsTemp[unitId] = visuals.map((visual) =>
        test.find((test) => test.id == visual)
      );
      this.selectedVisuals = Object.assign(
        {},
        this.nestObject(this.selectedVisuals, [posId, unitId], visuals)
      );
    },
    //make a nested object with this founction
    nestObject(obj, arr, val) {
      obj[arr[0]] = obj[arr[0]] || {};

      var tmpObj = obj[arr[0]];

      if (arr.length > 1) {
        arr.shift();
        this.nestObject(tmpObj, arr, val);
      } else obj[arr[0]] = val;
      return obj;
    },
    onChangeVideoWizard() {
      this.$refs.changeVideoWizardModal.show();
      //  this.$refs.changeVideoModal.show({
      //   maintenancePosId: posId,
      //   maintenanceUnitId: unitId,
      // });
    },
    closeChangeVideoWizardModal() {
      this.$refs.changeVideoWizardModal.hide();
      this.fetchData();
      this.fetchData2();
    },
  },
};

</script>
<style lang="scss" scoped></style>
<style lang="scss">
.mo-units-table {
  th label {
    display: flex;
    justify-content: center;
    margin: 0;

    select {
      font-size: 10px;
    }
  }

  th {
    text-align: center;
  }

  td {
    text-align: center;
    font-size: 0.7rem !important;
    padding: 5px !important;
  }

  &__status-text {
    font-weight: bold;
    font-size: 16px;
  }

  &__add-video {
    position: relative;

    &__icon {
      font-size: 12px;
      position: absolute;
      top: -5px;
      right: -5px;
    }
  }

  &__video {
    position: relative;

    & > span {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      font-size: 25px;
      color: white;
    }
  }

  .unit_count {
    font-weight: bold;
  }

  .unit-visuals {
    width: 100px;
  }

  .brand-name {
    max-width: 120px;
    width: 120px;
  }

  .retailer-name,
  .country-name {
    max-width: 130px;
    width: 130px;
  }

  .city {
    max-width: 110px;
    width: 110px;
  }

  .modem_status,
  .player_status {
    max-width: 80px;
  }

  .brand-name,
  .retailer-name,
  .country-name,
  .city {
    @media (max-width: 1500px) {
      max-width: 100px;
    }
  }

  .name,
  .unit-title {
    max-width: 12vw;
  }

  @media (max-width: 1500px) {
    .mo-units-table__pos-image {
      display: none;
    }
    .name,
    .unit-title {
      max-width: 110px;
    }
  }

  td.video,
  td.gallery {
    text-align: center;
    width: 40px;
  }

  td.modem_status,
  td.player_status {
    width: 10px;
  }

  .mo-table__edit {
    padding: 0 5px !important;
  }

  .mo-table__name {
    white-space: nowrap;
  }
}

.mo-pos-and-units-visuals-table {
  max-width: 1200px;
  min-width: 1200px;
  padding: 1px;

  .last_campaign-title {
    text-align: center;
  }

  .notes {
    width: 200px;
    text-align: center;
  }

  .type-name,
  .photo,
  .visible_width,
  .visible_height,
  .printable_height,
  .printable_width,
  .material-name {
    width: 100px;
    text-align: center;
  }
  .select {
    width: 50px;
  }
}
</style>
