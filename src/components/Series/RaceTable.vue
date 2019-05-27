<template>
  <q-markup-table seperator="cell" flat bordered>
    <thead>
      <tr>
        <th class="text-center" width="40">Round</th>
        <th class="text-center" width="40">Race</th>
        <th class="text-left">Track</th>
        <th class="text-left" v-if="$q.screen.gt.xs">Type</th>
        <th class="text-left" v-if="$q.screen.gt.xs">Configuration</th>
        <th class="text-center" width="90">Date</th>
        <th class="text-center" width="50" v-if="editingAllowed">Edit</th>
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
        <td v-if="$q.screen.gt.xs">{{race.raceType}}</td>
        <td v-if="$q.screen.gt.xs">{{race.configuration}}</td>
        <td>{{race.date}}</td>
        <td v-if="editingAllowed">
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
</template>

<script>
export default {
  name: 'Series',
  props: {
    editingAllowed: {
      type: Boolean,
      default: true,
    },
    loadedSeason: Object,
  },
  methods: {
    editRace(race) {
      this.$emit('editRace', race);
    },
  },
};
</script>
