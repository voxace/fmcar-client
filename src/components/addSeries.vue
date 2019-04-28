<template>
  <q-dialog
    v-model="visibility" persistent
    style="width: 700px; max-width: 90vw;"
  >

    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          Add Series
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          outlined v-model="addSeriesModel.name" label="Name" autofocus
          :rules="[ val => val && val.length > 0 || 'Please enter a name for the series']"
        />
      </q-card-section>

      <q-card-section>
        <div class="row">
          <div class="col q-pr-sm">
            <q-input
              outlined v-model="addSeriesModel.year" type="number" label="Year"
              :rules="[ val => val && val > 2018 && val < 2100 || 'Please enter a valid year']"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-select
          outlined v-model="addSeriesModel.game" :options="loadedGames"
          option-value="_id" option-label="name" label="Game" emit-value map-options
          :rules="[ val => val && val.length > 0 || 'Please select a game']"
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn
          flat label="Cancel"
          @click.stop="close"
        />
        <q-btn
          flat label="Add Series"
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
  props: ['visibility'],
  data() {
    return {
      years: ['2019'],
      loadedGames: [],
      addSeriesModel: {
        name: null,
        game: null,
        year: null,
      },
    };
  },
  mounted() {
    this.loadGamesList();
  },
  methods: {
    async loadGamesList() {
      await this.$axios
        .get('/game')
        .then((response) => {
          this.loadedGames = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    async addSeries() {
      console.log(this.addSeriesModel);
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
          this.$emit('seriesAdded', response.data);
          this.close();
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    close() {
      this.$emit('close');
    },
  },
  computed: {
    addSeriesValidation() {
      return this.addSeriesModel.name != null && this.addSeriesModel.name.length > 0
          && this.addSeriesModel.year != null && this.addSeriesModel.year.length > 0
          && this.addSeriesModel.game != null && this.addSeriesModel.game.length > 0;
    },
  },
};
</script>
