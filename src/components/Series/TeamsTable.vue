<template>
  <q-markup-table seperator="cell" flat bordered>
    <thead>
      <tr>
        <th class="text-left">Team Name</th>
        <th class="text-left">Driver A Name</th>
        <th class="text-left">Driver A Gamertag</th>
        <th class="text-left">Driver B Name</th>
        <th class="text-left">Driver B Gamertag</th>
        <th class="text-center" width="50" v-if="editingAllowed">Edit</th>
      </tr>
    </thead>
    <tbody v-if="loadedSeason.teams != null && loadedSeason.teams.length > 0">
      <tr
        v-for="team in loadedSeason.teams"
        :key="team._id"
      >
        <td class="text-left">{{race.round}}</td>
        <td class="text-left">{{race.number}}</td>
        <td class="text-left">{{race.track.name}}</td>
        <td class="text-left">{{race.type}}</td>
        <td class="text-left">{{race.configuration}}</td>
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
        <td colspan="6" class="text-center">No data found. Add a team...</td>
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
    editRace(team) {
      this.$emit('editTeam', team);
    },
  },
};
</script>
