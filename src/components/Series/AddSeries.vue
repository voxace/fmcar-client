<template>
  <q-dialog
    v-model="visibility" persistent
    style="width: 700px; max-width: 90vw;"
  >

    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          {{mode}} Series
        </div>
      </q-card-section>

      <q-card-section>
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
      years: ['2019'],
      loadedGames: [],
      loadingGames: false,
      addSeriesModel: {
        name: null,
        game: {
          _id: null,
          name: null,
        },
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
