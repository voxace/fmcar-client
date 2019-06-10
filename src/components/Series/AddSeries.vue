<template>
  <q-dialog
    v-model="visibility" persistent
  >

    <q-card
      style="width: 900px; max-width: 90vw;"
    >
      <q-card-section>
        <div class="text-h6">
          {{mode}} Series
        </div>
      </q-card-section>

      <q-card-section>
        <!-- TABS -->
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="info" label="Info" />
          <q-tab name="cars" label="Cars" />
          <q-tab name="roundTypes" label="Round Types" />
          <q-tab name="graphics" label="Graphics" />
        </q-tabs>
        <q-separator v-if="!editing" />
        <q-tab-panels v-model="tab" animated>

          <!--- INFO --->
          <q-tab-panel name="info">
            <div class="row">
              <!-- SERIES NAME -->
              <div class="col-xs-12">
                <q-input
                  outlined v-model="addSeriesModel.name"
                  label="Name" autofocus :dense="$q.screen.lt.sm"
                  :rules="[ val => val && val.length > 0 || 'Please enter a name for the series']"
                />
              </div>
              <!-- YEAR -->
              <div class="col-xs-12">
                <q-select
                  outlined v-model="addSeriesModel.year" type="number"
                  label="Year" :dense="$q.screen.lt.sm" :options="$store.state.years"
                  :rules="[ val => val != null || 'Please select a year']"
                />
              </div>
              <!-- GAME -->
              <div class="col-xs-12">
                <q-select
                  outlined v-model="addSeriesModel.game"
                  :options="loadedGames" :dense="$q.screen.lt.sm"
                  option-value="_id" option-label="name" label="Game" emit-value map-options
                  :rules="[ val => val != null || 'Please select a game']"
                  :disable="loadingGames" :disabled="loadingGames"
                >
                  <template v-slot:append v-if="loadingGames">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-select>
              </div>
              <!-- POINTS TABLES -->
              <div class="col-xs-12">
                <q-select
                  outlined v-model="addSeriesModel.pointsTables" use-chips
                  multiple hide-dropdown-icon input-debounce="0" new-value-mode="add-unique"
                  :options="loadedPointsTables" :dense="$q.screen.lt.sm" emit-value
                  option-value="_id" option-label="type" label="Points Tables" map-options
                  :rules="[ val => val && val.length > 0 || 'Select at least one points table']"
                  :disable="loadingPointsTables" :disabled="loadingPointsTables"
                >
                  <template v-slot:append v-if="loadingPointsTables">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                  <template v-slot:after>
                    <q-btn
                      round dense flat icon="add"
                      @click="addPointsTable()"
                    >
                      <q-tooltip content-class="bg-primary text-white">
                        Add a new points table
                      </q-tooltip>
                    </q-btn>
                  </template>
                </q-select>
              </div>
              <!-- DROP ROUND -->
              <div class="col-xs-12">
                <q-toggle
                  v-model="addSeriesModel.dropRound"
                  label="Drop worst round: "
                  left-label
                />
                <span v-if="addSeriesModel.dropRound" class="q-ml-md text-blue">
                  Each driver's worst round <strong>will not</strong> be included in their total
                </span>
              </div>
            </div>
          </q-tab-panel>

          <!-- ADD CARS -->
          <q-tab-panel
            name="cars" style="max-height: 400px;"
            ref="seriesCard" class="scroll"
          >
            <transition
              v-for="(carChoice, i) in addSeriesModel.carChoices" :key="i"
              appear
              enter-active-class="animated zoomIn slow-transition"
              leave-active-class="animated zoomOut slow-transition"
            >
              <div
                class="row q-pt-sm"
              >
                <!-- CAR -->
                <div class="col-xs-8 q-pr-xs">
                  <q-input
                    outlined dense label="Car" type="Text"
                    v-model="carChoice.car"
                  />
                </div>
                <!-- LIMIT -->
                <div class="col-xs-3 q-px-xs">
                  <q-input
                    outlined dense label="Limit" type="Number"
                    v-model="carChoice.limit"
                  >
                    <q-tooltip content-class="bg-primary text-white">
                      [Optional] 0 = Unlimited
                    </q-tooltip>
                  </q-input>
                </div>
                <div class="col-xs-1 q-pl-xs">
                  <q-btn
                    round size="sm" style="margin-top: 4px;"
                    icon="delete" color="red"
                    @click="deleteCarChoice(i)"
                  />
                </div>
              </div>
            </transition>
            <div class="row">
              <!-- ADD CAR BUTTON -->
              <div class="col-xs-12 q-pt-sm">
                <q-btn
                  id="addCarButton" :disabled="addCarButtonDisabled"
                  color="primary" icon="add" class="full-width"
                  @click="addCarChoice" label="Add Car Choice"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- ROUND TYPES -->
          <q-tab-panel name="roundTypes">
            <div class="row">
              <div class="col-xs-5 q-pr-sm">
                <p class="text-h6">Round Type</p>
                <transition
                  v-for="(roundType, i) in addSeriesModel.roundTypes" :key="i"
                  appear
                  enter-active-class="animated zoomIn slow-transition"
                  leave-active-class="animated zoomOut slow-transition"
                >
                  <div
                    class="row q-pt-sm"
                  >
                    <!-- ROUND TYPE -->
                    <div class="col-xs-10 q-pr-xs">
                      <q-input
                        outlined dense label="Round Type" type="Text"
                        v-model="roundType.name" @click="setCurrent(i)"
                      />
                    </div>
                    <div class="col-xs-2 q-pl-xs">
                      <q-btn
                        round size="sm" style="margin-top: 4px;"
                        icon="delete" color="red"
                        @click="deleteRoundType(i)"
                      />
                    </div>
                  </div>
                </transition>
                <div class="row">
                  <!-- ADD ROUND TYPE BUTTON -->
                  <div class="col-xs-12 q-pt-sm">
                    <q-btn
                      id="addRoundTypeButton" :disabled="addRoundTypeButtonDisabled"
                      color="primary" icon="add" class="full-width"
                      @click="addRoundType" label="Add Round Type"
                    />
                  </div>
                </div>
              </div>
              <div class="col-xs-7" v-if="addSeriesModel.roundTypes.length > 0">
                <p class="text-h6">Description</p>
                <!-- RACE TYPE DESCRIPTION -->
                <q-editor
                  v-model="addSeriesModel.roundTypes[current].description"
                  min-height="10rem"
                  width="100%"
                  :toolbar="[
                    ['bold', 'italic', 'underline'],
                    ['link'],
                    ['unordered', 'ordered'],
                  ]"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- GRAPHICS -->
          <q-tab-panel name="graphics">
            <div class="row">
              <!-- LOGO UPLOAD -->
              <div class="col-xs-12">
                <q-uploader
                  label="Series Logo"
                  auto-upload flat bordered
                  accept=".jpg, image/*"
                  field-name="upload"
                  :url="uploadUrl"
                  style="width: 100%"
                  @uploaded="logoUploaded"
                />
              </div>
              <!-- BANNER UPLOAD -->
              <div class="col-xs-12 q-pt-sm">
                <q-uploader
                  label="Series Banner"
                  auto-upload flat bordered
                  accept=".jpg, image/*"
                  field-name="upload"
                  :url="uploadUrl"
                  style="width: 100%"
                  @uploaded="bannerUploaded"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <!-- ACTION BUTTONS -->
      <q-card-actions align="right" class="text-primary">
        <q-btn
          flat label="Cancel"
          @click.stop="close"
        />
        <q-btn
          v-if="editing"
          flat label="Delete"
          text-color="red"
          @click="deleteSeries"
        />
        <q-btn
          flat label="Save"
          @click="addSeries" :disabled="!addSeriesValidation"
        />
      </q-card-actions>

    </q-card>

    <!-- ADD POINTS TABLE DIALOG -->
    <add-points-table-dialog
      v-if="addPointsTableDialog" :visibility="addPointsTableDialog"
      :editing="false" @close="addPointsTableDialogClosed"
    />
  </q-dialog>
</template>

<style>
.slow-transition {
  animation-duration: 0.5s;
}
</style>

<script>
/* eslint-disable no-underscore-dangle */

export default {
  name: 'Series',
  components: {
    addPointsTableDialog: () => import('../Admin/AddPointsTable.vue'),
  },
  props: {
    editing: Boolean,
    editingSeries: Object,
    visibility: Boolean,
  },
  data() {
    return {
      current: 0,
      uploadUrl: `${process.env.API}/upload`,
      tab: 'info',
      years: ['2019'],
      loadedGames: [],
      loadingGames: false,
      loadedPointsTables: [],
      loadingPointsTables: false,
      addPointsTableDialog: false,
      addSeriesModel: {
        name: null,
        game: null,
        year: null,
        pointsTables: [],
        carChoices: [],
        roundTypes: [],
        banner: null,
        logo: null,
        dropRound: false,
      },
    };
  },
  mounted() {
    // Loads required data
    this.loadGamesList();
    this.loadPointsTablesList();

    // If editing, copies data into the 'add series' model
    if (this.editing === true) {
      this.addSeriesModel.name = this.editingSeries.name;
      this.addSeriesModel.logo = this.editingSeries.logo;
      this.addSeriesModel.banner = this.editingSeries.banner;
      this.addSeriesModel.game = this.editingSeries.game;
      this.addSeriesModel.year = this.editingSeries.year;
      this.addSeriesModel.dropRound = this.editingSeries.dropRound;
      if (this.editingSeries.carChoices[0] != null) {
        this.addSeriesModel.carChoices = this.editingSeries.carChoices;
      }
      if (this.editingSeries.roundTypes[0] != null) {
        this.addSeriesModel.roundTypes = this.editingSeries.roundTypes;
      }
      if (this.editingSeries.pointsTables[0] != null) {
        this.addSeriesModel.pointsTables = this.editingSeries.pointsTables;
      }
      this.$forceUpdate();
    }
  },
  methods: {
    // File name info about the logo uploaded
    logoUploaded(info) {
      this.addSeriesModel.logo = info.xhr.response;
    },

    // File name info about the banner uploaded
    bannerUploaded(info) {
      this.addSeriesModel.banner = info.xhr.response;
    },

    // Adds a car choice
    addCarChoice() {
      // Add car
      this.addSeriesModel.carChoices.push({
        car: '',
        limit: null,
      });
      // Scroll to bottom
      setTimeout(() => {
        this.$refs.seriesCard.$el.scrollTo({
          top: 10000,
          left: 0,
          behavior: 'smooth',
        });
      }, 10);
    },

    // Deletes the specified car choice
    deleteCarChoice(i) {
      this.addSeriesModel.carChoices.splice(i, 1);
    },

    // Adds a round type
    addRoundType() {
      this.addSeriesModel.roundTypes.push({
        name: '',
        description: '',
      });
    },

    // Deletes the specified round type
    deleteRoundType(i) {
      this.addSeriesModel.roundTypes.splice(i, 1);
    },

    // Sets current round type by index
    setCurrent(i) {
      this.current = i;
    },

    // Loads all games
    async loadGamesList() {
      this.loadingGames = true;
      await this.$axios
        .get('/game')
        .then((response) => {
          this.loadedGames = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingGames = false;
    },

    // Loads all points tables
    async loadPointsTablesList() {
      this.loadingPointsTables = true;
      await this.$axios
        .get('/points')
        .then((response) => {
          this.loadedPointsTables = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingPointsTables = false;
    },

    // Saves by adding or updating a series
    save() {
      if (this.editing === true) {
        this.updateSeries();
      } else {
        this.addSeries();
      }
    },

    // Updates a series
    async updateSeries() {
      await this.$axios
        .patch(`/series/${this.editingSeries._id}`, { model: this.addSeriesModel })
        .then((response) => {
          console.log(response);
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Series updated successfully!',
          });
          this.$emit('seriesEdited', response.data);
          this.close();
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error updating series!',
          });
        });
    },

    // Creates a new series
    async addSeries() {
      await this.$axios
        .post('/series', { model: this.addSeriesModel })
        .then((response) => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Series added successfully!',
          });
          this.$emit('seriesAdded', response.data);
          this.close();
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error adding series!',
          });
        });
    },

    // Deletes the series
    async deleteSeries() {
      await this.$axios
        .delete(`/series/${this.editingSeries._id}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Series deleted successfully!',
          });
          this.close();
          this.$emit('seriesDeleted');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error deleting series!',
          });
        });
    },

    // Opens the points tables dialog
    addPointsTable() {
      this.addPointsTableDialog = true;
    },

    // Closes the points tables dialog and reloads the data
    addPointsTableDialogClosed() {
      this.loadPointsTablesList();
      this.addPointsTableDialog = false;
    },

    // Emits a 'close' event when the dialog is closed
    close() {
      this.$emit('close');
    },
  },
  computed: {
    // Validates compulsory form information
    addSeriesValidation() {
      return this.addSeriesModel.name != null && this.addSeriesModel.name.length > 0
          && this.addSeriesModel.year != null && this.addSeriesModel.game != null
          && this.addCarButtonDisabled === false && this.addRoundTypeButtonDisabled === false;
    },

    // Determines add or editing mode
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
    },

    // Disables add car button if no info has been added in to last input
    addCarButtonDisabled() {
      if (this.addSeriesModel.carChoices.length === 0) {
        return false;
      }
      if (this.addSeriesModel.carChoices[this.addSeriesModel.carChoices.length - 1].car === '') {
        return true;
      }
      return false;
    },

    // Disables add round type button if no info has been added in to last input
    addRoundTypeButtonDisabled() {
      if (this.addSeriesModel.roundTypes.length === 0) {
        return false;
      }
      if (this.addSeriesModel.roundTypes[this.addSeriesModel.roundTypes.length - 1].name === '') {
        return true;
      }
      return false;
    },
  },
};
</script>
