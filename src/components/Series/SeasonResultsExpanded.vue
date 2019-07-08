<template>
  <q-card style="width: 1800px; max-width: 90vw;">
    <q-card-section class="bg-primary text-white q-py-sm q-mb-md">
      <div class="text-subtitle2 text-center leaderboard">LEADERBOARD</div>
    </q-card-section>
    <q-card-section class="scroll height-1000">
      <q-markup-table flat>
        <thead class="text-center">
            <tr>
              <th width="40">Position</th>
              <th>Driver</th>
              <th width="50">Number</th>
              <th>Gamertag</th>
              <th>Team</th>
              <th v-for="(round, x) in loadedResults[0].rounds" :key="x">
                R{{round.round}}
              </th>
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
                <td v-for="(round, j) in result.rounds" :key="j">
                  {{round.roundTotal}}
                </td>
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
export default {
  name: 'seasonResultsTableExpanded',
  props: {
    loadedResults: Array,
  },
};
</script>
