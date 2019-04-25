<template>
  <q-page>
    <div class="row q-px-lg">
      <div class="col-xs-12">
        <h3>Series</h3>
      </div>

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
      seasons: [],
    };
  },
  mounted() {

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
