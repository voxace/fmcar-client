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
        <q-select
          outlined v-model="selectedSeries" :options="loadedSeriesList"
          option-label="name" option-value="_id" label="Series" map-options
        />
      </div>
      <div class="col-xs-3 q-pl-sm">
        <q-select
          outlined v-model="selectedSeason" :options="seasonList"
          option-label="season" option-value="_id" label="Season" map-options
        />
      </div>

      <!-- SEASON TABLE -->
      <div v-if="loadedSeason != null" class="col-xs-12 q-py-md">
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
          <tbody v-if="loadedSeason.races != null && loadedSeason.races.length > 0">
            <tr
              v-for="race in loadedSeason.races"
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
          @click="addSeasonDialog = true"
          color="primary" icon="directions_car"
        >
          <q-tooltip anchor="center left" self="center right" >
            Add Season
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
    <add-series-dialog
      :visibility="addSeriesDialog"
      @close="addSeriesDialog = false" @seriesAdded="seriesAdded"
    />

    <!-- ADD RACE DIALOG -->
    <add-race-dialog
      v-if="selectedSeries && selectedSeason"
      :series="selectedSeries" :season="selectedSeason" :visibility="addRaceDialog"
      @close="addRaceDialog = false" @raceAdded="raceAdded"
    />

    <!-- ADD SEASON DIALOG -->
    <add-season-dialog
      v-if="selectedSeries"
      :series="selectedSeries" :visibility="addSeasonDialog"
      @close="addSeasonDialog = false" @seasonAdded="seasonAdded"
    />

  </q-page>
</template>

<style>
</style>

<script>
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */

export default {
  name: 'Series',
  components: {
    addRaceDialog: () => import('components/addRace.vue'),
    addSeriesDialog: () => import('components/addSeries.vue'),
    addSeasonDialog: () => import('components/addSeason.vue'),
  },
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
      selectedYear: null,
      selectedSeries: null,
      selectedSeason: null,
      years: ['2018', '2019', '2020'],
      loadedSeriesList: [],
      loadedSeason: null,
      addRaceDialog: false,
      addSeriesDialog: false,
      addSeasonDialog: false,
    };
  },
  methods: {
    async loadSeriesList() {
      await this.$axios
        .get(`/series/year/${this.selectedYear}`)
        .then((response) => {
          this.loadedSeriesList = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    async loadSeasonData() {
      await this.$axios
        .get(`/season/id/${this.selectedSeason._id}/populate`)
        .then((response) => {
          this.loadedSeason = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    raceAdded() {
      this.loadSeasonData();
    },
    seasonAdded(season) {
      this.selectedSeries.seasons.push(season);
      this.selectedSeason = this.selectedSeries.seasons[this.selectedSeries.seasons.length - 1];
      this.$forceUpdate();
      this.loadSeasonData();
    },
    seriesAdded(series) {
      console.log(`Seasons: ${series.seasons}`);
      this.loadedSeriesList.push(series);
      this.selectedYear = series.year;
      this.selectedSeries = series;
      setTimeout(() => {
        this.selectedSeries.seasons[0] = {
          _id: series.seasons[0],
          season: 1,
        };
        this.selectedSeason = this.selectedSeries.seasons[0];
      }, 200);
    },
  },
  computed: {
    seasonList() {
      if (this.selectedSeries != null && this.selectedSeries.seasons.length > 0) {
        return this.selectedSeries.seasons;
      }
      return [];
    },
  },
  watch: {
    selectedYear() {
      this.loadSeriesList();
    },
    selectedSeries() {
      this.selectedSeason = null;
    },
    selectedSeason() {
      this.loadSeasonData();
    },
  },
};
</script>
