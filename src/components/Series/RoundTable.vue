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
      <tr
        v-for="round in loadedSeason"
        :key="round._id"
      >
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
