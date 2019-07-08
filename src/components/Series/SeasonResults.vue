<template>
  <q-card flat bordered>
    <q-card-section class="bg-primary text-white q-py-sm q-mb-md">
      <div class="text-subtitle2 text-center leaderboard">LEADERBOARD</div>
    </q-card-section>
    <q-card-section class="scroll height-1000">
      <q-markup-table flat>
        <thead class="bg-primary text-white text-center">
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
              <tr :key="result._id" class="text-center">
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
    </q-card-section>
  </q-card>
</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'roundResultsDialog',
  props: {
    season: Object,
    visibility: Boolean,
  },
  data() {
    return {
      loadingResults: false,
      loadedResults: [],
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
        .catch((error) => {
          console.log(`Error: ${error}`);
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
