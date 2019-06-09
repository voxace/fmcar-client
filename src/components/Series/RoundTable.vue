<template>
  <q-markup-table seperator="cell" flat bordered>
    <thead>
      <tr>
        <th class="text-center" width="40">Round</th>
        <th class="text-left">Track</th>
        <th class="text-left" v-if="$q.screen.gt.xs">Type</th>
        <th class="text-left" v-if="$q.screen.gt.xs">Configuration</th>
        <th class="text-center" width="50" v-if="editingAllowed">Edit</th>
      </tr>
    </thead>
    <tbody v-if="loadedSeason != null && loadedSeason.length > 0">
      <template v-for="round in loadedSeason">
        <tr :key="round._id" class="cursor-pointer">
          <td class="text-center">{{round.round}}</td>
          <td>{{round.track.name}}</td>
          <td v-if="$q.screen.gt.xs">{{round.roundType}}</td>
          <td v-if="$q.screen.gt.xs">{{round.configuration}}</td>
          <td v-if="editingAllowed">
            <q-btn
              round color="primary" icon="edit"
              size="xs" @click="editRound(round)"
            />
          </td>
        </tr>
        <tr v-for="(session, i) in round.sessions" :key="session._id">
          <td colspan="5" class="text-center cursor-pointer">
            <div class="row">
              <div class="col-xs-2">
                <strong>Session:</strong> {{ i }} - {{ session.sessionType }}
              </div>
              <div class="col-xs-2">
                <strong>Date:</strong> {{ session.date }}
              </div>
              <div class="col-xs-2">
                <strong>Time:</strong> {{ session.time }}
              </div>
              <div class="col-xs-2">
                <strong>Laps:</strong> {{ session.laps }}
              </div>
              <div class="col-xs-2">
                <strong>Points Table:</strong> {{ session.pointsTable.name }}
              </div>
              <div class="col-xs-2">
                <strong>Weather:</strong> {{ session.weather }}
              </div>
            </div>
          </td>
        </tr>
      </template>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5" class="text-center">No data found. Add a round...</td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script>
export default {
  name: 'Series',
  props: {
    editingAllowed: {
      type: Boolean,
      default: true,
    },
    loadedSeason: Array,
  },
  methods: {
    editRound(round) {
      this.$emit('editRound', round);
    },
  },
};
</script>
