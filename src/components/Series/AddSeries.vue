<template>
  <q-dialog
    v-model="visibility" persistent
    style="width: 700px; max-width: 90vw;"
  >

    <q-card
      ref="seriesCard" class="scroll"
      style="min-width: 400px; max-height: 500px;"
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
                  :rules="[ val => val.length > 0 || 'Please select a game']"
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

            </div>
          </q-tab-panel>
           <q-tab-panel name="cars">
              <div
                class="row q-pt-sm"
                v-for="(carChoice, i) in addSeriesModel.carChoices" :key="i"
              >
                <div class="col-xs-8 q-pr-xs">
                  <q-input
                    outlined dense label="Car" type="Text"
                    v-model="carChoice.car"
                  />
                </div>
                <div class="col-xs-4 q-pl-xs">
                  <q-input
                    outlined dense label="Limit" type="Number"
                    v-model="carChoice.limit"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-xs-12 q-pt-sm">
                  <q-btn
                    id="addCarButton"
                    color="primary" icon="add" class="full-width"
                    @click="addCarChoice" label="Add Car Choice"
                  />
                </div>
              </div>
           </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

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
      tab: 'info',
      years: ['2019'],
      loadedGames: [],
      loadingGames: false,
      addSeriesModel: {
        name: null,
        game: {
          _id: null,
          name: null,
        },
        carChoices: [],
        year: null,
      },
    };
  },
  mounted() {
    this.loadGamesList();
    if (this.editing === true) {
      this.addSeriesModel.name = this.editingSeries.name;
      this.addSeriesModel.game = this.editingSeries.game;
      this.addSeriesModel.year = this.editingSeries.year;
      this.$forceUpdate();
    }
  },
  methods: {
    addCarChoice() {
      this.addSeriesModel.carChoices.push({
        car: '',
        limit: 0,
      });
      this.$refs.seriesCard.scrollTop = this.$refs.seriesCard.scrollHeight;
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
    async addSeries() {
      if (this.editing === true) {
        await this.$axios
          .patch(`/series/${this.editingSeries._id}`, {
            name: this.addSeriesModel.name,
            year: this.addSeriesModel.year,
            game: this.addSeriesModel.game,
          })
          .then((response) => {
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
          .post('/series', {
            name: this.addSeriesModel.name,
            year: this.addSeriesModel.year,
            game: this.addSeriesModel.game,
          })
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
          && this.addSeriesModel.year > 2018 && this.addSeriesModel.year < 2100
          && this.addSeriesModel.game != null && this.addSeriesModel.game.length > 0;
    },
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
    },
  },
};
</script>
