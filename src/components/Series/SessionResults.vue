<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="width: 900px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">
          {{mode}} Session Results
        </div>
        <div class="row">
          <div class="col-xs-8">
            <div class="text-subtitle2">
              Round: {{round.round}}
            </div>
            <div class="text-subtitle2">
              Track: {{round.track.name}}
            </div>
            <div class="text-subtitle2">
              Session: {{session.sessionNumber}} - {{session.sessionType}}
            </div>
          </div>
          <div
            class="col-xs-4"
            v-if="$q.screen.gt.xs"
          >
            <q-toggle
              class="q-py-xs"
              label="Race Time"
              v-model="raceTime"
              dense
            />
            <br>
            <q-toggle
              class="q-py-sm"
              label="Fastest Lap"
              v-model="fastestLap"
              dense
            />
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-markup-table seperator="cell" flat bordered>
          <thead class="bg-primary text-white text-center">
            <tr>
              <th width="40">Position</th>
              <th>Driver</th>
              <th v-if="$q.screen.gt.xs">Team</th>
              <th v-if="$q.screen.gt.xs && raceTime">Race Time</th>
              <th v-if="$q.screen.gt.xs && fastestLap">Fastest Lap</th>
              <th>Points</th>
              <th v-if="editingAllowed">Edit</th>
            </tr>
          </thead>
          <tbody v-if="loadedResults != null && loadedResults.length > 0">
            <template v-for="(result,i) in loadedResults">
              <tr :key="result._id" class="text-center">
                <td width="40">{{result.position}}</td>
                <td v-if="!result.penalty">{{result.user.name}}</td>
                <td v-else>
                  {{result.user.name}}
                  <q-icon
                    name="warning" size="17px" color="red" class="q-pl-sm q-pb-xs"
                  >
                    <q-tooltip
                      anchor="center middle" self="center left"
                      content-class="bg-red" content-style="font-size: 13px"
                      transition-show="scale" transition-hide="scale"
                    >
                      <strong>Penalty:</strong> {{result.penalty}}
                    </q-tooltip>
                  </q-icon>
                </td>
                <td v-if="$q.screen.gt.xs">{{result.team.name}}</td>
                <td v-if="$q.screen.gt.xs && raceTime">{{result.raceTime}}</td>
                <td v-if="$q.screen.gt.xs && fastestLap">{{result.fastestLap}}</td>
                <td>{{points(i)}}</td>
                <td v-if="editingAllowed">
                  <q-btn
                    round color="primary" icon="edit"
                    size="xs" @click.stop="editResult(result)"
                  />
                </td>
              </tr>
            </template>
            <tr v-if="editingAllowed">
              <td colspan="7" class="text-center">
                <q-btn
                  label="Add Result" icon="add" color="primary"
                  class="full-width"  @click="addResult()"
                />
              </td>
            </tr>
          </tbody>
          <tbody v-else>
          <tr>
            <td colspan="6" class="text-center">
              No results found
            </td>
          </tr>
          <tr v-if="editingAllowed">
            <td colspan="6" class="text-center">
              <q-btn
                label="Add Result" icon="add" color="primary"
                class="full-width"  @click="addResult()"
              />
            </td>
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
    <!-- ADD RESULT DIALOG -->
    <add-result-dialog
      v-if="editingAllowed && addResultDialog"
      :editing="editing" :editingResult="editingResult"
      :round="round" :session="session" :results="loadedResults"
      :visibility="addResultDialog"
      @close="addResultDialog = false" @resultAdded="resultAdded"
    />
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'sessionResultsDialog',
  components: {
    addResultDialog: () => import('components/Series/AddResult.vue'),
  },
  props: {
    session: Object,
    round: Object,
    visibility: Boolean,
  },
  data() {
    return {
      editing: false,
      loadingResults: false,
      loadedResults: [],
      addResultDialog: false,
      raceTime: false,
      fastestLap: false,
      editingResult: {
        position: 1,
      },
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
        .get(`/results/session/${this.session._id}`)
        .then((response) => {
          this.loadedResults = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingResults = false;
    },

    // Launches the edit result dialog
    editResult(result) {
      this.editing = true;
      this.editingResult = result;
      this.addResultDialog = true;
    },

    // Launches the add result dialog
    addResult() {
      this.editing = false;
      this.addResultDialog = true;
    },

    // Reloads table once result is added
    resultAdded() {
      this.loadResults();
    },

    // Closes the dialog
    close() {
      this.$emit('close');
    },

    points(i) {
      return this.session.pointsTable.values[i];
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
