<template>
  <q-page padding>
    <div class="row">

      <!-- HEADING -->
      <div class="col-xs-12">
        <h3>Series</h3>
      </div>

      <!-- SERIES SELECTION -->
      <div class="col-xs-3 q-pr-sm">
        <q-select outlined v-model="selectedYear" :options="years" label="Year" />
      </div>
      <div class="col-xs-6 q-px-sm">
        <q-select outlined v-model="selectedSeries" :options="loadedSeriesNames"
          label="Series"  />
      </div>
      <div class="col-xs-3 q-pl-sm">
        <q-select outlined v-model="selectedSeason" :options="seasons" label="Season" />
      </div>

      <!-- SERIES TABLE -->
      <div v-if="info.races != null" class="col-xs-12 q-py-md">
        <q-markup-table seperator="cell" flat bordered>
          <thead>
            <tr>
              <th class="text-center" width="70">Round</th>
              <th class="text-center" width="70">Race</th>
              <th class="text-left">Track</th>
              <th class="text-left">Type</th>
              <th class="text-left">Configuration</th>
              <th class="text-center" width="120">Date</th>
            </tr>
          </thead>
          <tbody v-if="info.races != null && info.races.length > 0">
            <tr
              v-for="race in info.races"
              :key="race._id"
            >
              <td class="text-center">{{race.round}}</td>
              <td class="text-center">{{race.number}}</td>
              <td>{{race.track.name}}</td>
              <td>{{race.type}}</td>
              <td>{{race.configuration}}</td>
              <td>{{race.date}}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6" class="text-center">No data found. Add a race...</td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </div>

    <!-- FLOATING BUTTON -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        icon="add"
        direction="up"
        color="positive"
      >
        <q-fab-action @click="addSeriesDialog = true" color="primary" icon="event_note" >
          <q-tooltip anchor="center left" self="center right" >
            Add Series
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="selectedSeries && selectedSeason"
          @click="addRaceDialog = true"
          color="primary" icon="directions_car"
        >
          <q-tooltip anchor="center left" self="center right" >
            Add Race
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>

    <!-- ADD SERIES DIALOG -->
    <q-dialog
      v-model="addSeriesDialog" persistent
       style="width: 700px; max-width: 80vw;"
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
            <div class="col q-pl-sm">
              <q-input
                outlined v-model="addSeriesModel.season" type="number" label="Season"
                :rules="[ val => val && val > 0 && val < 100 || 'Please enter a valid season']"
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
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat label="Add Series" v-close-popup
            @click="addSeries" :disabled="!addSeriesValidation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ADD RACE DIALOG -->
    <q-dialog
      v-model="addRaceDialog" persistent
       style="width: 700px; max-width: 80vw;"
    >
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            Add Race
          </div>
          <div class="text-subtitle2">
            Series: {{selectedSeries}}
          </div>
          <div class="text-subtitle2">
            Season: {{selectedSeason}}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row">
            <div class="col q-pr-sm">
              <q-input
                outlined v-model="addRaceModel.round"
                autofocus type="number" label="Round"
                :rules="[ val => val && val > 0 && val < 100 || 'Please enter a round']"
              />
            </div>
            <div class="col q-pl-sm">
              <q-input
                outlined v-model="addRaceModel.number" type="number" label="Race Number"
                :rules="[ val => val && val > 0 && val < 10 || 'Please enter a race number']"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <q-select
            outlined v-model="addRaceModel.track" :options="loadedTracks"
            option-value="_id" option-label="name" label="Track" emit-value map-options
            :rules="[ val => val && val.length > 0 || 'Please select a track']"
          />
        </q-card-section>

        <q-card-section>
          <q-select
            outlined v-model="addRaceModel.pointsTable" :options="loadedPointsTables"
            option-value="_id" option-label="type" label="Points Table" emit-value map-options
            :rules="[ val => val && val.length > 0 || 'Please select a points table']"
          />
        </q-card-section>

        <q-card-section>
          <q-input
            outlined v-model="addRaceModel.type" label="Type"
            :rules="[ val => val && val.length > 0 || 'Please enter the type of race']"
          />
        </q-card-section>

        <q-card-section>
          <q-input
            outlined v-model="addRaceModel.configuration" label="Configuration"
            :rules="[ val => val && val.length > 0 || 'Please enter the track configuration']"
          />
        </q-card-section>

        <q-card-section>
          <q-input
            outlined v-model="addRaceModel.date" label="Date" mask="##-##-####"
            :rules="[ val => dateIsValid() || 'Please enter a valid date']"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="rawDate" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat label="Add Race" v-close-popup
            @click="addRace" :disabled="!addRaceValidation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<style>
</style>

<script>
/* eslint-disable no-underscore-dangle */
import { date } from 'quasar';

export default {
  name: 'Series',
  meta: {
    title: 'Series',
    titleTemplate: title => `FMCAR - ${title}`,
    meta: {
      description: { name: 'FMCAR Series', content: 'Results' },
      keywords: { name: 'fmcar forza xbox racing', content: 'FMCAR' },
      equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
    },
  },
  data() {
    return {
      date,
      rawDate: null,
      info: {
        series: null,
        pointsTable: null,
        track: {
          name: null,
        },
        round: null,
        number: null,
        configuration: null,
        date: null,
        races: null,
      },
      selectedYear: null,
      selectedSeries: null,
      selectedSeason: null,
      years: ['2019'],
      loadedSeries: [],
      loadedGames: [],
      loadedTracks: [],
      loadedPointsTables: [],
      seasons: [],
      addRaceDialog: false,
      addSeriesDialog: false,
      addRaceModel: {
        series: null,
        pointsTable: null,
        track: null,
        round: null,
        number: null,
        configuration: null,
        date: null,
      },
      addSeriesModel: {
        name: null,
        game: null,
        season: null,
        year: null,
      },
    };
  },
  mounted() {
    this.getToday();
    this.loadGamesList();
    this.loadTrackList();
    this.loadPointsTablesList();
  },
  methods: {
    async loadSeriesList() {
      await this.$axios
        .get(`/series/year/${this.selectedYear}`)
        .then((response) => {
          this.loadedSeries = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    async loadSeriesData() {
      await this.$axios
        .get(`/series/${this.selectedSeries}/${this.selectedYear}/${this.selectedSeason}`)
        .then((response) => {
          this.info = response.data;
          this.addRaceModel.series = response.data._id;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
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
    async loadTrackList() {
      await this.$axios
        .get('/track')
        .then((response) => {
          this.loadedTracks = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    async loadPointsTablesList() {
      await this.$axios
        .get('/points')
        .then((response) => {
          this.loadedPointsTables = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    async addSeries() {
      await this.$axios
        .post('/series', {
          name: this.addSeriesModel.name,
          year: this.addSeriesModel.year,
          season: this.addSeriesModel.season,
          game: this.addSeriesModel.game,
        })
        .then((response) => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Series added successfully!',
          });
          this.loadedSeries.push(response.data);
          this.selectedYear = response.data.year;
          this.selectedSeries = response.data.name;
          this.selectedSeason = response.data.season;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    async addRace() {
      await this.$axios
        .post('/race', {
          series: this.addRaceModel.series,
          pointsTable: this.addRaceModel.pointsTable,
          track: this.addRaceModel.track,
          round: this.addRaceModel.round,
          number: this.addRaceModel.number,
          type: this.addRaceModel.type,
          configuration: this.addRaceModel.configuration,
          date: this.addRaceModel.date,
        })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Race added successfully!',
          });
          this.loadSeriesData();
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    getToday() {
      const timeStamp = Date.now();
      this.addRaceModel.date = date.formatDate(timeStamp, 'DD-MM-YYYY');
      this.rawDate = date.formatDate(timeStamp, 'YYYY/MM/DD');
    },
    dateIsValid() {
      if (this.addRaceModel.date != null && this.addRaceModel.date.length > 9) {
        const data = this.addRaceModel.date.split('-');
        if (Date.parse(`${data[2]}-${data[1]}-${data[0]}`) > 0) {
          this.rawDate = `${data[2]}/${data[1]}/${data[0]}`;
          return true;
        }
        return false;
      }
      return false;
    },
  },
  computed: {
    loadedSeriesNames() {
      const names = this.loadedSeries.map(item => item.name);
      return Array.from(new Set(names));
    },
    addSeriesValidation() {
      return this.addSeriesModel.name != null && this.addSeriesModel.name.length > 0
          && this.addSeriesModel.year != null && this.addSeriesModel.year.length > 0
          && this.addSeriesModel.season != null && this.addSeriesModel.season.length > 0
          && this.addSeriesModel.game != null && this.addSeriesModel.game.length > 0;
    },
    addRaceValidation() {
      console.log(this.addRaceModel);
      return this.addRaceModel.series != null && this.addRaceModel.series.length > 0
          && this.addRaceModel.pointsTable != null && this.addRaceModel.pointsTable.length > 0
          && this.addRaceModel.track != null && this.addRaceModel.track.length > 0
          && this.addRaceModel.round != null && this.addRaceModel.round.length > 0
          && this.addRaceModel.number != null && this.addRaceModel.number.length > 0
          && this.addRaceModel.type != null && this.addRaceModel.type.length > 0
          && this.addRaceModel.configuration != null && this.addRaceModel.configuration.length > 0
          && this.addRaceModel.date != null && this.addRaceModel.date.length > 0;
    },
  },
  watch: {
    selectedYear() {
      this.loadSeriesList();
      if (this.selectedYear != null && this.selectedSeries != null && this.selectedSeason != null) {
        this.loadSeriesData();
      }
    },
    selectedSeries(name) {
      const count = this.loadedSeries.filter(item => item.name === name).length;
      this.seasons = [];
      for (let i = 1; i <= count; i += 1) {
        this.seasons.push(i.toString());
      }
      if (this.selectedYear != null && this.selectedSeries != null && this.selectedSeason != null) {
        this.loadSeriesData();
      }
    },
    selectedSeason() {
      if (this.selectedYear != null && this.selectedSeries != null && this.selectedSeason != null) {
        this.loadSeriesData();
      }
    },
    rawDate(val) {
      console.log(val);
      this.addRaceModel.date = date.formatDate(new Date(val), 'DD-MM-YYYY');
    },
  },
};
</script>
