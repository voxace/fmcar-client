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
          <q-tab name="raceTypes" label="Race Types" />
          <q-tab name="graphics" label="Graphics" />
        </q-tabs>
        <q-separator v-if="!editing" />
        <q-tab-panels v-model="tab" animated>

          <!--- INFO --->
          <q-tab-panel name="info">
            <div class="row">
              <div class="col-xs-12">
                <q-input
                  outlined v-model="addSeriesModel.name"
                  label="Name" autofocus :dense="$q.screen.lt.sm"
                  :rules="[ val => val && val.length > 0 || 'Please enter a name for the series']"
                />
              </div>
              <div class="col-xs-12">
                <q-input
                  outlined v-model="addSeriesModel.year" type="number"
                  label="Year" :dense="$q.screen.lt.sm"
                  :rules="[ val => val && val > 2017 && val < 2100 || 'Please enter a valid year']"
                />
              </div>
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
              <div class="col-xs-12">
                <q-select
                  outlined v-model="addSeriesModel.pointsTables" use-chips
                  multiple hide-dropdown-icon input-debounce="0" new-value-mode="add-unique"
                  :options="loadedPointsTables" :dense="$q.screen.lt.sm"
                  option-value="_id" option-label="type" label="Points Table" emit-value map-options
                  :rules="[ val => val && val.length > 0 || 'Please select points tables']"
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
                </q-select>
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
                <div class="col-xs-8 q-pr-xs">
                  <q-input
                    outlined dense label="Car" type="Text"
                    v-model="carChoice.car"
                  />
                </div>
                <div class="col-xs-3 q-px-xs">
                  <q-input
                    outlined dense label="Limit" type="Number"
                    v-model="carChoice.limit"
                  >
                    <q-tooltip content-class="bg-amber text-black">
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
              <div class="col-xs-12 q-pt-sm">
                <q-btn
                  id="addCarButton" :disabled="addCarButtonDisabled"
                  color="primary" icon="add" class="full-width"
                  @click="addCarChoice" label="Add Car Choice"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- RACE TYPES -->
          <q-tab-panel name="raceTypes">
            <div class="row">
              <div class="col-xs-5 q-pr-sm">
                <p class="text-h6">Race Type</p>
                <transition
                  v-for="(raceType, i) in addSeriesModel.raceTypes" :key="i"
                  appear
                  enter-active-class="animated zoomIn slow-transition"
                  leave-active-class="animated zoomOut slow-transition"
                >
                  <div
                    class="row q-pt-sm"
                  >
                    <div class="col-xs-10 q-pr-xs">
                      <q-input
                        outlined dense label="Race Type" type="Text"
                        v-model="raceType.name" @click="setCurrent(i)"
                      />
                    </div>
                    <div class="col-xs-2 q-pl-xs">
                      <q-btn
                        round size="sm" style="margin-top: 4px;"
                        icon="delete" color="red"
                        @click="deleteRaceType(i)"
                      />
                    </div>
                  </div>
                </transition>
                <div class="row">
                  <div class="col-xs-12 q-pt-sm">
                    <q-btn
                      id="addRaceTypeButton" :disabled="addRaceTypeButtonDisabled"
                      color="primary" icon="add" class="full-width"
                      @click="addRaceType" label="Add Race Type"
                    />
                  </div>
                </div>

              </div>
              <div class="col-xs-7">
                <p class="text-h6">Description</p>
                <q-editor
                  v-model="addSeriesModel.raceTypes[current].description"
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
      addSeriesModel: {
        name: null,
        logo: null,
        banner: null,
        game: null,
        carChoices: [],
        raceTypes: [{
          name: '',
          description: 'Enter a description of the race type...',
        }],
        pointsTables: [],
        year: null,
      },
    };
  },
  mounted() {
    this.loadGamesList();
    this.loadPointsTablesList();
    if (this.editing === true) {
      this.addSeriesModel.name = this.editingSeries.name;
      this.addSeriesModel.logo = this.editingSeries.logo;
      this.addSeriesModel.banner = this.editingSeries.banner;
      this.addSeriesModel.game = this.editingSeries.game;
      this.addSeriesModel.year = this.editingSeries.year;
      if (this.editingSeries.carChoices[0] != null) {
        this.addSeriesModel.carChoices = this.editingSeries.carChoices;
      }
      if (this.editingSeries.raceTypes[0] != null) {
        this.addSeriesModel.raceTypes = this.editingSeries.raceTypes;
      }
      if (this.editingSeries.pointsTables[0] != null) {
        this.addSeriesModel.pointsTables = this.editingSeries.pointsTables;
      }
      this.$forceUpdate();
    }
  },
  methods: {
    logoUploaded(info) {
      this.addSeriesModel.logo = info.xhr.response;
    },
    bannerUploaded(info) {
      this.addSeriesModel.banner = info.xhr.response;
    },
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
    deleteCarChoice(i) {
      this.addSeriesModel.carChoices.splice(i, 1);
    },
    addRaceType() {
      this.addSeriesModel.raceTypes.push({
        name: '',
        description: '',
      });
    },
    deleteRaceType(i) {
      this.addSeriesModel.raceTypes.splice(i, 1);
    },
    setCurrent(i) {
      this.current = i;
    },
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
    async addSeries() {
      if (this.editing === true) {
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
      } else {
        await this.$axios
          .post('/series', { model: this.addSeriesModel })
          .then((response) => {
            this.$q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'fas fa-check-circle',
              message: 'Series added successfully!',
            });
            console.log(response.data);
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
      }
    },
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
    close() {
      this.$emit('close');
    },
  },
  computed: {
    addSeriesValidation() {
      return this.addSeriesModel.name != null && this.addSeriesModel.name.length > 0
          && this.addSeriesModel.year != null && this.addSeriesModel.game != null
          && this.addCarButtonDisabled === false && this.addRaceTypeButtonDisabled === false;
    },
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
    },
    addCarButtonDisabled() {
      if (this.addSeriesModel.carChoices.length === 0) {
        return false;
      }
      if (this.addSeriesModel.carChoices[this.addSeriesModel.carChoices.length - 1].car === '') {
        return true;
      }
      return false;
    },
    addRaceTypeButtonDisabled() {
      if (this.addSeriesModel.raceTypes.length === 0) {
        return false;
      }
      if (this.addSeriesModel.raceTypes[this.addSeriesModel.raceTypes.length - 1].name === '') {
        return true;
      }
      return false;
    },
  },
};
</script>
