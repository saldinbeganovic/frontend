// store module used only for managing multi-step form state
import { getVisualsOfCompany } from "@/api/admin/company/unit/visual";
import { getVisualCampaign } from "@/api/user/campaigns/campaigns";
import Vue from "vue";

const shippingTypeNameToIdMap = {
  pos: 1,
  company: 2,
  custom: 3
};

const shippingTypeIdToNameMap = {
  1: "pos",
  2: "company",
  3: "custom"
};

const shippingTypeNameToDescription = {
  pos: "To each point of sale",
  company: `To group headquarters`,
  custom: `To a new address`
};

export default {
  state: () => ({
    // basic campaign info
    title: "",
    description: "",
    image: null,
    // shipping type ("pos"|"company"|"custom")
    shippingType: "",
    // shipping types populated on data fetch
    printingShippingType: "",
    decoratingShippingType: "",
    // custom shipping address (if provided)
    customAddress: "",
    // campaign raw data
    campaignData: null,
    // graphic files added to the campaign
    graphics: [],
    // selected visuals (visualId => true|false)
    selectedVisuals: {},
    // selected pos (posId => true|false)
    selectedPos: {},
    // visual items filters (filter by posId or unitId)
    posId: null,
    unitId: null,
    // visual items 2d array used in Info table view
    printingVisualItems: [],
    decoratingVisualItems: [],
    // maps posId to an array of corresponding visual ids (posId => [...])
    posToVisualsMap: {},
    // maps visualId to posId (visualId => posId)
    visualsToPosMap: {},
    // maps posId to corresponding pos address string (posId => "address")
    posToAddressMap: {},
    // maps posId to corresponding decorating house info (posId => {houseId, deadline})
    decoratingHousesInfoMap: {},
    // maps posId to corresponding printing house info (posId => {houseId, deadline})
    printingHousesInfoMap: {},
    graphicSizeMap: {}
  }),
  mutations: {
    setDecoratingShippingTypeId(store, typeId) {
      store.decoratingShippingType = shippingTypeIdToNameMap[typeId];
    },
    setPrintingShippingTypeId(store, typeId) {
      store.printingShippingType = shippingTypeIdToNameMap[typeId];
    },
    setPosFilter(store, posId) {
      store.posId = posId;
    },
    setUnitFilter(store, unitId) {
      // TODO: exclude selectedVisuals that do not belong to unitId
      store.unitId = unitId;
    },
    setCampaignData(store, value) {
      store.campaignData = value;
      if (value) {
        store.title = value.title;
        store.description = value.description;
      }
    },
    addGraphic(store, value) {
      store.graphics.push(value);
    },
    addGraphicSizeMap(store, value) {
      store.graphicSizeMap = { ...store.graphicSizeMap, ...value };
    },
    setSelectedPos(store, value) {
      store.selectedPos = value;
    },
    setSelectedVisuals(store, value) {
      store.selectedVisuals = value;
    },
    setPrintingVisualItems(store, value) {
      store.printingVisualItems = value;
    },
    setDecoratingVisualItems(store, value) {
      store.decoratingVisualItems = value;
    },
    setGraphics(store, value) {
      store.graphics = value;
    },
    setTitle(store, value) {
      store.title = value;
    },
    setImage(store, value) {
      store.image = value;
    },
    setDescription(store, value) {
      store.description = value;
    },
    setDeliveryType(store, value) {
      store.shippingType = value;
    },
    setPrintingHouseData(store, { posId, houseId, deadline }) {
      Vue.set(store.printingHousesInfoMap, posId, {
        houseId,
        deadline
      });
    },
    setDecoratingHouseData(store, { posId, houseId, deadline }) {
      Vue.set(store.decoratingHousesInfoMap, posId, {
        houseId,
        deadline
      });
    },
    setDeliveryAddress(store, { type, customAddress }) {
      store.shippingType = type;
      store.customAddress = customAddress;
    },
    // computed map setters
    setPosToAddressMap(store, value) {
      store.posToAddressMap = value;
    },
    setPosToVisualsMap(store, value) {
      store.posToVisualsMap = value;
    },
    setVisualsToPosMap(store, value) {
      store.visualsToPosMap = value;
    },
    setPrintingHouseInfoMap(store, value) {
      store.printingHousesInfoMap = value;
    },
    setDecoratingHouseInfoMap(store, value) {
      store.decoratingHousesInfoMap = value;
    }
  },
  getters: {
    getImage(store) {
      return store.image;
    },
    getGraphicSizeMap(store) {
      return store.graphicSizeMap;
    },
    allPos(state) {
      // TODO: remove parseFloat after uuid implementation
      return Object.keys(state.posToVisualsMap).map(parseFloat);
    },
    // determines if store is in invalid state (e.g. if the user refreshes the page)
    isStateEmpty(state) {
      return state.graphics.length === 0;
    },
    isPrintingSubmitted(state) {
      return state.campaignData && !!state.campaignData.printing_submitted;
    },
    isDecoratingSubmitted(state) {
      return state.campaignData && !!state.campaignData.decorating_submitted;
    },
    isSaved(state) {
      return !!state.campaignData;
    },
    selectedVisuals(state) {
      return state.selectedVisuals;
    },
    selectedVisualsArray(state) {
      // TODO: remove parseInt after uuid implementation
      return Object.keys(state.selectedVisuals)
        .filter(id => !!state.selectedVisuals[id])
        .map(parseFloat);
    },
    selectedPos(state) {
      return state.selectedPos;
    },
    selectedPosArray(state) {
      // TODO: remove parseInt after uuid implementation
      return Object.keys(
        Object.keys(state.selectedVisuals)
          .filter(id => !!state.selectedVisuals[id])
          .map(parseFloat)
          .reduce(
            (p, c) => Object.assign(p, { [state.visualsToPosMap[c]]: true }),
            {}
          )
      ).map(parseFloat);
    },
    selectedGraphicsMap(state) {
      return state.graphics.reduce(
        (p, c) => Object.assign(p, { [c.id]: true }),
        {}
      );
    },
    addressForType(state, _, rootState) {
      return function(posId) {
        let address = state.customAddress;
        if (state.shippingType === "pos") {
          address = state.posToAddressMap[posId];
        } else if (state.shippingType === "company") {
          address = rootState.company.address;
        }
        return address;
      };
    },
    posToVisualsMap(state) {
      return state.posToVisualsMap;
    },
    visualsToPosMap(state) {
      return state.visualsToPosMap;
    },
    printingItems(state, getters) {
      return getters.isDecoratingEdit
        ? state.printingVisualItems.map(group =>
            group.filter(
              e =>
                (state.posId ? e.posId === state.posId : true) &&
                (state.unitId ? e.unitId === state.unitId : true)
            )
          )
        : state.printingVisualItems;
    },
    // returns true if user is editing info after
    // he already sent the order to the printing houses
    isDecoratingEdit(_, getters) {
      return getters.isSaved && getters.isPrintingSubmitted;
    },
    decoratingItems(state) {
      return state.decoratingVisualItems;
    },
    description(state) {
      return state.description;
    },
    graphics(state) {
      return state.graphics;
    },
    title(state) {
      return state.title;
    },
    printingHousesInfoMap(store) {
      return store.printingHousesInfoMap;
    },
    decoratingHousesInfoMap(store) {
      return store.decoratingHousesInfoMap;
    },
    decoratingShippingType(state) {
      return shippingTypeNameToDescription[state.decoratingShippingType];
    },
    printingShippingType(state) {
      return shippingTypeNameToDescription[state.printingShippingType];
    },
    selectedVisualsOfPos(state, getters) {
      return function(posId) {
        const allPosVisuals = state.posToVisualsMap[posId];
        return getters.selectedVisualsArray.filter(id =>
          // TODO: remove parseInt when id is uuid
          allPosVisuals.includes(parseFloat(id))
        );
      };
    },
    // data for campaign creation endpoint
    creationData(state, getters, rootState) {
      const points_of_sale = getters.selectedPosArray.map(posId => {
        const pOpts = state.printingHousesInfoMap[posId];
        return {
          address: getters.addressForType(posId),
          point_of_sale_id: posId,
          printing_house_id: pOpts.houseId,
          printing_deadline: pOpts.deadline,
          visuals: getters.selectedVisualsOfPos(posId)
        };
      });
      return {
        title: state.title,
        description: state.description,
        cover_photo: state.image,
        printing_shipping_type: shippingTypeNameToIdMap[state.shippingType],
        attachments: state.graphics.map(g => g.id),
        company_id:
          rootState.user.company_id || localStorage.getItem("company-id"),
        points_of_sale
      };
    },
    decorationData(state, getters) {
      return {
        decorating_shipping_type: shippingTypeNameToIdMap.pos,
        details: getters.selectedPosArray.map(posId => {
          const dOpts = state.decoratingHousesInfoMap[posId];
          const pOpts = state.printingHousesInfoMap[posId];
          return {
            id: pOpts.detailId,
            decorating_house_id: dOpts.houseId,
            deadline: dOpts.deadline,
            visuals: getters.selectedVisualsOfPos(posId),
            address: state.posToAddressMap[posId]
          };
        })
      };
    }
  },
  actions: {
    fetchExistingCampaignInfo({ commit }, campaignId) {
      getVisualCampaign(campaignId).then(data => {
        const {
          posToAddressMap,
          posToVisualsMap,
          visualItems,
          decoratingItems,
          visualsToPosMap
        } = buildCampaignInfo(
          data.details.map(d => d.point_of_sale),
          false
        );
        commit("setImage", data.cover_photo);
        commit("setPosToAddressMap", posToAddressMap);
        commit("setPosToVisualsMap", posToVisualsMap);
        commit("setVisualsToPosMap", visualsToPosMap);
        commit("setPrintingVisualItems", visualItems);
        commit("setDecoratingVisualItems", decoratingItems);
        // select all visuals & pos by default
        commit("setSelectedPos", buildSelectedMap(visualItems, "posId"));
        commit("setSelectedVisuals", buildSelectedMap(visualItems, "id"));
        commit("setGraphics", data.attachments);
        // build & populate houses maps
        commit("setPrintingHouseInfoMap", buildHouseInfoMap(data, "printing"));
        commit(
          "setDecoratingHouseInfoMap",
          buildHouseInfoMap(data, "decorating")
        );
        commit("setCampaignData", data);
        commit("setPrintingShippingTypeId", data.printing_shipping_type);
        commit("setDecoratingShippingTypeId", data.decorating_shipping_type);
      });
    },
    fetchNewCampaignInfo({ commit, getters, state }) {
      getVisualsOfCompany(getters.companyId, state.posId, state.unitId).then(
        data => {
          const {
            posToAddressMap,
            posToVisualsMap,
            visualItems,
            decoratingItems,
            visualsToPosMap
          } = buildCampaignInfo(data, true);
          commit("setPosToAddressMap", posToAddressMap);
          commit("setPosToVisualsMap", posToVisualsMap);
          commit("setVisualsToPosMap", visualsToPosMap);
          commit("setPrintingVisualItems", visualItems);
          commit("setDecoratingVisualItems", decoratingItems);
          // TODO: remove after uuid implementation
          // keep selected only filtered pos & units
          // ones that are not shown in the table any more, shouldn't be selected either
          const newPos = Object.keys(posToVisualsMap).map(parseFloat);
          const newVisuals = Object.keys(visualsToPosMap).map(parseFloat);
          // reset all other maps
          commit(
            "setSelectedPos",
            getters.selectedPosArray
              .filter(oldPosId => newPos.includes(oldPosId))
              .reduce((p, c) => Object.assign(p, { [c]: true }), {})
          );
          commit(
            "setSelectedVisuals",
            getters.selectedVisualsArray
              .filter(oldVisId => newVisuals.includes(oldVisId))
              .reduce((p, c) => Object.assign(p, { [c]: true }), {})
          );
          commit("setPrintingHouseInfoMap", {});
          commit("setDecoratingHouseInfoMap", {});
        }
      );
    },
    resetStore({ commit }) {
      commit("setPosToAddressMap", {});
      commit("setGraphics", []);
      commit("setPosToVisualsMap", {});
      commit("setPrintingVisualItems", []);
      commit("setSelectedPos", {});
      commit("setSelectedPos", {});
      commit("setSelectedVisuals", {});
      commit("setPrintingHouseInfoMap", {});
      commit("setDecoratingHouseInfoMap", {});
      commit("setTitle", "");
      commit("setDescription", "");
      commit("setCampaignData", null);
    }
  }
};

// extracts & build visual items array
function buildCampaignInfo(data, isNew) {
  const {
    posToAddressMap,
    posToVisualsMap,
    items: visualItems,
    visualsToPosMap
  } = buildVisualItemsWithMap(data, isNew, false);
  const { items: decoratingItems } = buildVisualItemsWithMap(data, isNew, true);
  return {
    posToAddressMap,
    posToVisualsMap,
    visualItems,
    decoratingItems,
    visualsToPosMap
  };
}

function buildVisualItemsWithMap(data, isNew, decorating) {
  const posToAddressMap = {};
  // TODO: remove bellow map (posToVisuals)
  const posToVisualsMap = {};
  const visualsToPosMap = {};
  const items = data
    .map(pos => {
      const visuals = [
        ...pos.units
          .map(unit =>
            unit.visuals.map(visual => {
              posToAddressMap[pos.id] = pos.address;
              visualsToPosMap[visual.id] = pos.id;
              const item = {
                id: visual.id,
                posId: pos.id,
                address: pos.address,
                pos: pos.name,
                unit: unit.title,
                unitId: unit.id,
                visual: visual.type.name,
                country: pos.country ? pos.country.name : "-",
                city: pos.city || "-",
                brand: unit.brand
              };
              if (decorating && !isNew) {
                return visual.pivot.decorating_submitted ? item : null;
              } else {
                return item;
              }
            })
          )
          .flat()
          .filter(e => e !== null)
      ];
      if (visuals.length > 0) {
        posToVisualsMap[pos.id] = visuals.map(e => e.id);
      }
      return visuals;
    })
    .filter(e => e.length > 0);
  return { posToVisualsMap, posToAddressMap, visualsToPosMap, items };
}

// extracts & builds selected map
function buildSelectedMap(items, key) {
  return items
    .flat()
    .map(e => e[key])
    .reduce((p, id) => Object.assign({}, p, { [id]: true }), {});
}

// builds printing/decorating houses info map
function buildHouseInfoMap(data, houseType) {
  return data.details
    .map(e => ({
      [e.point_of_sale.id]: {
        detailId: e.id,
        houseId: e[`${houseType}_house`] ? e[`${houseType}_house`].id : null,
        deadline: e[`${houseType}_deadline`],
        email: e[`${houseType}_house`] ? e[`${houseType}_house`].email : null,
        houseName: e[`${houseType}_house`] ? e[`${houseType}_house`].name : null
      }
    }))
    .reduce((p, c) => Object.assign({}, p, c), {});
}
