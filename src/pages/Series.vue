<template>
  <q-page padding>
    <div class="row">

      <!-- HEADING -->
      <div class="col-xs-12">
        <h3>Series</h3>
      </div>

      <!-- SERIES SELECTION -->
      <div class="col-xs-12 col-sm-3 q-px-sm">
        <!-- YEAR -->
        <q-select
          outlined v-model="selectedYear" :options="$store.state.years"
          label="Year" v-bind:class="{ 'q-py-xs': $q.screen.lt.sm }"
        />
      </div>
      <div class="col-xs-12 col-sm-6 q-px-sm">
        <!-- SERIES -->
        <q-select
          outlined v-model="selectedSeries" :options="loadedSeriesList"
          option-label="name" option-value="_id" label="Series" map-options
          :disable="selectedYear == null" :disabled="selectedYear == null"
          v-bind:class="{ 'q-py-xs': $q.screen.lt.sm }"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section>
                None available
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:append v-if="seriesLoading">
            <q-avatar>
              <q-spinner
                color="primary"
                size="2em"
              />
            </q-avatar>
          </template>
          <template v-slot:after v-if="editingAllowed">
            <q-avatar>
              <q-btn
                round color="primary" icon="edit"
                :disabled="selectedSeries == null"
                size="xs" @click="editSeries()"
              />
            </q-avatar>
          </template>
        </q-select>
      </div>
      <div class="col-xs-12 col-sm-3 q-px-sm">
        <!-- SEASON -->
        <q-select
          outlined v-model="selectedSeason" :options="seasonList"
          option-label="season" option-value="_id" map-options emit-value
          label="Season" v-bind:class="{ 'q-py-xs': $q.screen.lt.sm }"
          :disable="selectedSeries == null" :disabled="selectedSeries == null"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section>
                None available
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:append v-if="seriesLoading">
            <q-avatar>
              <q-spinner
                color="primary"
                size="2em"
              />
            </q-avatar>
          </template>
          <template v-slot:after v-if="editingAllowed">
            <q-avatar>
              <q-btn
                round color="primary" icon="edit"
                :disabled="selectedSeason == null"
                size="xs" @click="editSeason()"
              />
            </q-avatar>
          </template>
        </q-select>
      </div>
    </div>

    <!-- ROUNDS/TEAMS TABS -->
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
          <q-tab name="Rounds" label="Rounds" />
          <q-tab name="Teams" label="Teams" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <!-- ROUNDS TABLE -->
          <q-tab-panel name="Rounds">
            <div v-if="loadedSeason != null" class="col-xs-12 q-py-md">
              <round-table
                :loadedSeason="loadedSeason.rounds"
                @editRound="editRound" :editingAllowed="editingAllowed"
              />
            </div>
          </q-tab-panel>
          <!-- TEAMS TABLE -->
          <q-tab-panel name="Teams">
            <div v-if="loadedSeason != null" class="col-xs-12 q-py-md">
              <teams-table
                :loadedSeason="loadedSeason.teams"
                @editTeam="editTeam" :editingAllowed="editingAllowed"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- FLOATING BUTTON -->
    <q-page-sticky v-if="editingAllowed" position="bottom-right" :offset="[18, 18]">
      <q-fab
        icon="add"
        direction="up"
        color="positive"
      >
        <!-- ADD SERIES -->
        <q-fab-action @click="addSeries" color="primary" icon="event_note" >
          <q-tooltip anchor="center left" self="center right" >
            Add Series
          </q-tooltip>
        </q-fab-action>
        <!-- ADD SEASON -->
        <q-fab-action
          v-if="selectedSeries"
          @click="addSeason"
          color="primary" icon="event"
        >
          <q-tooltip anchor="center left" self="center right" >
            Add Season
          </q-tooltip>
        </q-fab-action>
        <!-- ADD RACE -->
        <q-fab-action
          v-if="selectedSeries && selectedSeason && tab=='Rounds'"
          @click="addRound"
          color="primary" icon="directions_car"
        >
          <q-tooltip anchor="center left" self="center right" >
            Add Round
          </q-tooltip>
        </q-fab-action>
        <!-- ADD TEAM -->
        <q-fab-action
          v-if="selectedSeries && selectedSeason && tab=='Teams'"
          @click="addTeam"
          color="primary" icon="people"
        >
          <q-tooltip anchor="center left" self="center right" >
            Add Team
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>

    <!-- ADD SERIES DIALOG -->
    <add-series-dialog
      v-if="addSeriesDialog" :visibility="addSeriesDialog"
      :editing="editing" :editingSeries="selectedSeries"
      @close="addSeriesDialog = false" @seriesAdded="seriesAdded"
      @seriesEdited="seriesEdited"
    />

    <!-- ADD SEASON DIALOG -->
    <add-season-dialog
      v-if="selectedSeries && loadedSeason && addSeasonDialog"
      :editing="editing" :editingSeason="loadedSeason"
      :series="selectedSeries" :visibility="addSeasonDialog"
      @close="addSeasonDialog = false" @seasonAdded="seasonAdded"
      @seasonDeleted="seasonDeleted"
    />

    <!-- ADD ROUND DIALOG -->
    <add-round-dialog
      v-if="loadedSeason && selectedSeries && addRoundDialog"
      :editing="editing" :editingRound="editingRound"
      :series="selectedSeries" :season="loadedSeason"
      :visibility="addRoundDialog"
      @close="addRoundDialog = false" @roundAdded="roundAdded"
    />

    <!-- ADD TEAM DIALOG -->
    <add-team-dialog
      v-if="selectedSeries && selectedSeason && addTeamDialog"
      :editing="editing" :editingTeam="editingTeam"
      :series="selectedSeries" :season="loadedSeason"
      :visibility="addTeamDialog"
      @close="addTeamDialog = false" @teamAdded="teamAdded"
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
    addRoundDialog: () => import('components/Series/AddRound.vue'),
    addSeriesDialog: () => import('components/Series/AddSeries.vue'),
    addSeasonDialog: () => import('components/Series/AddSeason.vue'),
    addTeamDialog: () => import('components/Series/AddTeam.vue'),
    roundTable: () => import('components/Series/RoundTable.vue'),
    teamsTable: () => import('components/Series/TeamsTable.vue'),
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
      seriesLoading: false,
      tab: 'Rounds',
      selectedYear: null,
      selectedSeries: null,
      selectedSeason: null,
      loadedSeriesList: [],
      loadedSeries: null,
      loadedSeason: null,
      addRoundDialog: false,
      addSeriesDialog: false,
      addSeasonDialog: false,
      addTeamDialog: false,
      editingRound: {
        pointsTable: null,
        track: null,
        round: null,
        number: null,
        type: null,
        configuration: null,
        date: null,
      },
      editingTeam: null,
    };
  },
  methods: {
    async loadSeriesList() {
      this.seriesLoading = true;
      this.selectedSeries = null;
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
        .get(`/season/id/${this.selectedSeason}`)
        .then((response) => {
          this.loadedSeason = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.$q.loading.hide();
    },
    roundAdded() {
      this.loadSeasonData();
    },
    teamAdded() {
      this.loadSeasonData();
    },
    seasonAdded(season) {
      this.selectedSeries.seasons.push(season);
      this.selectedSeason = this.selectedSeries.seasons[this.selectedSeries.seasons.length - 1];
      this.$forceUpdate();
      this.loadSeasonData();
    },
    seriesAdded(series) {
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
    seriesEdited(series) {
      this.seriesLoading = true;
      this.selectedYear = series.year;
      this.loadSeriesList();
      setTimeout(() => {
        for (let i = 0; i < this.loadedSeriesList.length; i += 1) {
          if (this.loadedSeriesList[i]._id === series._id) {
            this.selectedSeries = this.loadedSeriesList[i];
          }
        }
      }, 1000);
      this.seriesLoading = false;
    },
    async seasonDeleted() {
      this.seriesLoading = true;
      const currentSeries = this.selectedSeries;
      await this.loadSeriesList();
      setTimeout(() => {
        for (let i = 0; i < this.loadedSeriesList.length; i += 1) {
          if (this.loadedSeriesList[i]._id === currentSeries._id) {
            this.selectedSeries = this.loadedSeriesList[i];
          }
        }
      }, 100);
      this.seriesLoading = false;
    },
    addRound() {
      this.editing = false;
      this.addRoundDialog = true;
    },
    addSeries() {
      this.editing = false;
      this.addSeriesDialog = true;
    },
    addSeason() {
      this.editing = false;
      this.addSeasonDialog = true;
    },
    addTeam() {
      this.editing = false;
      this.addTeamDialog = true;
    },
    editRound(round) {
      this.editing = true;
      this.editingRound = round;
      this.addRoundDialog = true;
    },
    editSeries() {
      this.editing = true;
      this.addSeriesDialog = true;
    },
    editSeason() {
      this.editing = true;
      this.addSeasonDialog = true;
    },
    editTeam(team) {
      this.editing = true;
      this.editingTeam = team;
      this.addTeamDialog = true;
    },
  },
  computed: {
    seasonList() {
      if (this.selectedSeries && this.selectedSeries.seasons.length > 0) {
        return this.selectedSeries.seasons;
      }
      return [];
    },
    editingAllowed() {
      if (this.$store.state.user) {
        return this.$store.state.user.admin;
      }
      return false;
    },
  },
  watch: {
    selectedYear() {
      this.loadSeriesList();
    },
    selectedSeries() {
      this.selectedSeason = this.selectedSeries.seasons[0]._id;
    },
    selectedSeason() {
      this.loadSeasonData();
    },
  },
};
</script>
