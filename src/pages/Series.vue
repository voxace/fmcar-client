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
        >
          <template v-slot:append v-if="seriesLoading">
            <q-avatar>
              <q-spinner
                color="primary"
                size="2em"
              />
            </q-avatar>
          </template>
        </q-select>
      </div>
      <div class="col-xs-3 q-pl-sm">
        <q-select
          outlined v-model="selectedSeason" :options="seasonList"
          option-label="season" option-value="_id" label="Season" map-options
        >
          <template v-slot:append v-if="seriesLoading">
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

    <!-- RACES/TEAMS TABS -->
    <div class="row" v-if="loadedSeason != null">
      <div class="col-xs-12 q-pt-md">
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="Races" label="Races" />
            <q-tab name="Teams" label="Teams" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>

            <!-- RACES TABLE -->
            <q-tab-panel name="Races">
              <div v-if="loadedSeason != null" class="col-xs-12 q-py-md">
                <q-markup-table seperator="cell" flat bordered>
                  <thead>
                    <tr>
                      <th class="text-center" width="70">Round</th>
                      <th class="text-center" width="70">Race</th>
                      <th class="text-left">Track</th>
                      <th class="text-left">Type</th>
                      <th class="text-left">Configuration</th>
                      <th class="text-center" width="100">Date</th>
                      <th class="text-center" width="50">Edit</th>
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
                      <td>
                        <q-btn
                          round color="primary" icon="edit"
                          size="xs" @click="editRace(race)"
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr>
                      <td colspan="6" class="text-center">No data found. Add a race...</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </q-tab-panel>

            <!-- TEAMS TABLE -->
            <q-tab-panel name="Teams">
              <div class="text-h6">Teams</div>
              No teams yet!
            </q-tab-panel>

          </q-tab-panels>
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
          v-if="selectedSeries"
          @click="addSeasonDialog = true"
          color="primary" icon="event"
        >
          <q-tooltip anchor="center left" self="center right" >
            Add Season
          </q-tooltip>
        </q-fab-action>

        <q-fab-action
          v-if="selectedSeries && selectedSeason"
          @click="addRace"
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
      :visibility="addSeriesDialog && addSeriesDialog" :editing="editing"
      @close="addSeriesDialog = false" @seriesAdded="seriesAdded"
    />

    <!-- ADD RACE DIALOG -->
    <add-race-dialog
      v-if="selectedSeries && selectedSeason && addRaceDialog" :editing="editing"
      :series="selectedSeries" :season="selectedSeason"
      :visibility="addRaceDialog" :editingRace="editingRace"
      @close="addRaceDialog = false" @raceAdded="raceAdded"
    />

    <!-- ADD SEASON DIALOG -->
    <add-season-dialog
      v-if="selectedSeries && addSeasonDialog"
      :series="selectedSeries" :visibility="addSeasonDialog" :editing="editing"
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
      editing: false,
      seriesLoading: false,
      tab: 'Races',
      selectedYear: null,
      selectedSeries: null,
      selectedSeason: null,
      years: ['2018', '2019', '2020'],
      loadedSeriesList: [],
      loadedSeason: null,
      addRaceDialog: false,
      addSeriesDialog: false,
      addSeasonDialog: false,
      editingRace: {
        pointsTable: null,
        track: null,
        round: null,
        number: null,
        type: null,
        configuration: null,
        date: null,
      },
    };
  },
  methods: {
    async loadSeriesList() {
      this.seriesLoading = true;
      await this.$axios
        .get(`/series/year/${this.selectedYear}`)
        .then((response) => {
          this.loadedSeriesList = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.seriesLoading = false;
    },
    async loadSeasonData() {
      this.$q.loading.show();
      await this.$axios
        .get(`/season/id/${this.selectedSeason._id}/populate`)
        .then((response) => {
          this.loadedSeason = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.$q.loading.hide();
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
    addRace() {
      this.editing = false;
      this.addRaceDialog = true;
    },
    editRace(race) {
      this.editing = true;
      this.addRaceDialog = true;
      this.editingRace = race;
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
