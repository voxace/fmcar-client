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
      <div v-if="info != null" class="col-xs-12 q-py-md">
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
          <tbody>
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
          <q-input outlined v-model="addSeriesModel.name" label="Name" autofocus />
        </q-card-section>

        <q-card-section>
          <div class="row">
            <div class="col q-pr-sm">
              <q-input outlined v-model="addSeriesModel.year" type="number" label="Year" />
            </div>
            <div class="col q-pl-sm">
              <q-input outlined v-model="addSeriesModel.season" type="number" label="Season" />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <q-select outlined v-model="addSeriesModel.game" :options="loadedGames"
            option-value="_id" option-label="name" label="Game" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add Series" v-close-popup />
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
                autofocus type="number" label="Round" />
            </div>
            <div class="col q-pl-sm">
              <q-input outlined v-model="addRaceModel.race" type="number" label="Race" />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <q-select outlined v-model="addRaceModel.track" :options="options" label="Track" />
        </q-card-section>

        <q-card-section>
          <q-select
            outlined v-model="addRaceModel.pointsTable"
            :options="options" label="Points Table" />
        </q-card-section>

        <q-card-section>
          <q-input outlined v-model="addRaceModel.type" label="Type"/>
        </q-card-section>

        <q-card-section>
          <q-input outlined v-model="addRaceModel.configuration" label="Configuration"/>
        </q-card-section>

        <q-card-section>
          <q-input outlined v-model="addRaceModel.date" label="Date" mask="date" :rules="['date']">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="date" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add Race" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<style>
</style>

<script>
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
      info: null,
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
        configuraton: null,
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
    this.loadGamesList();
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
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      console.log(this.info);
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
  },
  computed: {
    loadedSeriesNames() {
      const names = this.loadedSeries.map(item => item.name);
      return Array.from(new Set(names));
    },
  },
  watch: {
    selectedYear() {
      this.selectedSeries = null;
      this.loadSeriesList();
    },
    selectedSeries(name) {
      const count = this.loadedSeries.filter(item => item.name === name).length;
      this.seasons = [];
      this.selectedSeason = null;
      for (let i = 1; i <= count; i += 1) {
        this.seasons.push(i.toString());
      }
    },
    selectedSeason() {
      if (this.selectedYear != null && this.selectedSeries != null && this.selectedSeason != null) {
        this.loadSeriesData();
      }
    },
  },
};
</script>
