<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="width: 900px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">
          {{mode}} Session Results
        </div>
        <div class="text-subtitle2">
          Round: {{round.round}}
        </div>
        <div class="text-subtitle2">
          Track: {{round.track.name}}
        </div>
        <div class="text-subtitle2">
          Session: {{session + 1}} - {{round.sessions[session].sessionType}}
        </div>
      </q-card-section>
      <q-card-section>
        <q-markup-table seperator="cell" flat bordered>
          <thead class="bg-primary text-white text-center">
            <tr>
              <th width="40">Position</th>
              <th>Driver</th>
              <th v-if="$q.screen.gt.xs">Team</th>
              <th v-if="$q.screen.gt.xs">Race Time</th>
              <th v-if="$q.screen.gt.xs">Fastest Lap</th>
              <th v-if="editingAllowed">Edit</th>
            </tr>
          </thead>
          <tbody v-if="loadedResults != null && loadedResults.length > 0">
            <template v-for="result in loadedResults">
              <tr :key="result._id" class="text-center">
                <td width="40">{{result.position}}</td>
                <td>{{result.user.name}}</td>
                <td v-if="$q.screen.gt.xs">{{result.team.name}}</td>
                <td v-if="$q.screen.gt.xs">{{result.raceTime}}</td>
                <td v-if="$q.screen.gt.xs">{{result.fastestLap}}</td>
                <td v-if="editingAllowed">
                  <q-btn
                    round color="primary" icon="edit"
                    size="xs" @click.stop="editResult(result)"
                  />
                </td>
              </tr>
            </template>
          </tbody>
          <tbody v-else>
          <tr>
            <td colspan="6" class="text-center">No data found. Add some results...</td>
          </tr>
        </tbody>
        </q-markup-table>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn
          flat label="Close"
          @click.stop="close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'sessionResultsDialog',
  props: {
    editing: Boolean,
    session: Number,
    round: Object,
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
        .get(`/results/session/${this.round.sessions[this.session]._id}`)
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
  computed: {
    // Choose between 'View' or 'Editing' mode
    mode() {
      if (this.editingAllowed === true) {
        return 'Edit';
      }
      return 'View';
    },
    editingAllowed() {
      return this.$store.getters.editingAllowed;
    },
  },
};
</script>
