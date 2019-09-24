<template>
  <q-card flat bordered>
    <q-card-section class="bg-primary text-white q-py-sm q-mb-md row">
      <div class="col-xs-11 text-subtitle2 text-center leaderboard">
        LEADERBOARD
      </div>
      <div class="col-xs-1 text-right">
        <q-btn
          flat round color="white" size="sm" icon="zoom_out_map"
          @click="visibility = true"
        />
      </div>
    </q-card-section>
    <q-card-section class="scroll height-1000">
      <q-markup-table flat v-if="!loadingResults">
        <thead class="text-center">
            <tr>
              <th width="40">Position</th>
              <th>Driver</th>
              <th width="50">Number</th>
              <th>Gamertag</th>
              <th>Team</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody v-if="loadedResults != null && loadedResults.length > 0">
            <template v-for="(result, i) in loadedResults">
              <tr :key="result._id.user" class="text-center">
                <td width="40">{{i+1}}</td>
                <td>{{result._id.user}}</td>
                <td>{{result._id.number}}</td>
                <td>{{result._id.gamertag}}</td>
                <td>{{result._id.team}}</td>
                <td>{{result.seasonTotal}}</td>
              </tr>
            </template>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6" class="text-center">
                No results found
              </td>
            </tr>
          </tbody>
      </q-markup-table>
      <div v-else class="leaderboard-spinner">
        <q-spinner color="primary" size="5em" />
      </div>
    </q-card-section>
    <q-dialog v-model="visibility">
      <season-results-expanded v-if="visibility" :loadedResults="loadedResults" />
    </q-dialog>
  </q-card>
</template>

<style scoped>
.leaderboard {
  padding: 5px;
  padding-left: 8%;
}
.height-1000 {
  max-height: 1000px;
}
.leaderboard-spinner {
  text-align: center;
  padding: 80px 0px;
}
</style>


<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'seasonResultsTable',
  components: {
    seasonResultsExpanded: () => import('components/Series/SeasonResultsExpanded.vue'),
  },
  props: {
    season: String,
  },
  data() {
    return {
      loadingResults: false,
      loadedResults: [],
      visibility: false,
    };
  },
  mounted() {
    this.loadResults();
  },
  methods: {
    // Loads the results for this session
    async loadResults() {
      this.loadingResults = true;
      await this.$axios
        .get(`/results/season/${this.season}`)
        .then((response) => {
          this.loadedResults = response.data;
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error loading results!',
          });
        });
      this.loadingResults = false;
    },

    // Closes the dialog
    close() {
      this.$emit('close');
    },
  },
};
</script>
