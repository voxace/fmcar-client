<template>
  <q-markup-table seperator="cell" flat bordered>
    <thead>
      <tr>
        <th class="text-left">Team</th>
        <th class="text-left">Driver</th>
        <th class="text-left">Gamertag</th>
        <th class="text-left">Car</th>
        <th class="text-center" width="50" v-if="editingAllowed">Edit</th>
      </tr>
    </thead>
    <tbody v-if="loadedSeason.teams != null && loadedSeason.teams.length > 0">
      <tr
        v-for="team in loadedSeason.teams"
        :key="team._id"
      >
        <td class="text-left">{{team.name}}</td>
        <td class="text-left">{{team.driver_a.name}}<br/>{{team.driver_b.name}}</td>
        <td class="text-left">{{team.driver_a.gamertag}}<br/>{{team.driver_b.gamertag}}</td>
        <td class="text-left">{{team.car}}</td>
        <td v-if="editingAllowed">
          <q-btn
            round color="primary" icon="edit"
            size="xs" @click="editTeam(team)"
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
    editTeam(team) {
      this.$emit('editTeam', team);
    },
  },
};
</script>
