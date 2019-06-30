<template>
  <q-markup-table seperator="cell" flat bordered>
    <thead class="bg-primary text-white">
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
        <tr :key="round._id" class="cursor-pointer" @click="toggleRound(round._id)">
          <td class="text-center">{{round.round}}</td>
          <td>{{round.track.name}}</td>
          <td v-if="$q.screen.gt.xs">{{round.roundType}}</td>
          <td v-if="$q.screen.gt.xs">{{round.configuration}}</td>
          <td v-if="editingAllowed">
            <q-btn
              round color="primary" icon="edit"
              size="xs" @click.stop="editRound(round)"
            />
          </td>
        </tr>
        <transition
          :key="round._id+'_2'" appear
          enter-active-class="animated zoomIn"
          leave-active-class="animated zoomOut"
        >
          <tr
            class="bg-grey-1 session-row"
            v-if="roundToggle == round._id"
          >
            <td
              v-if="!sessionsLoading"
              colspan="8" class="text-center no-padding-row"
            >
              <q-markup-table seperator="cell" dense flat square class="bg-grey-1">
                <thead v-if="loadedSessions.length > 0">
                  <tr class="sessions-thead">
                    <th width="40">Session</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Laps</th>
                    <th v-if="$q.screen.gt.xs && editingAllowed">Points Table</th>
                    <th>Weather</th>
                    <th v-if="editingAllowed">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="session in loadedSessions"
                    :key="session._id" class="cursor-pointer" @click="viewResults(round, session)"
                  >
                    <td>{{ session.sessionNumber }}</td>
                    <td>{{ session.sessionType }}</td>
                    <td>{{ session.date }}</td>
                    <td>{{ session.time }}</td>
                    <td>{{ session.laps }}</td>
                    <td v-if="$q.screen.gt.xs && editingAllowed">{{ session.pointsTable.type }}</td>
                    <td>{{ session.weather }}</td>
                    <td v-if="editingAllowed">
                      <q-btn
                        round color="primary" icon="edit"
                        size="xs" @click.stop="editSession(round, session)"
                      />
                    </td>
                  </tr>
                  <tr class="sessions-thead" v-if="editingAllowed">
                    <td colspan="8" class="sessions-add">
                      <q-btn
                        color="primary" icon="add" class="full-width"
                        @click="addSession(round)" label="Add Session" flat
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </td>
            <td v-else colspan="8" class="text-center no-padding-row">
              <q-spinner color="primary" size="3em" />
            </td>
          </tr>
        </transition>
      </template>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5" class="text-center">No data found. Add a round...</td>
      </tr>
    </tbody>
    <!-- SESSION RESULTS -->
    <session-results
      v-if="sessionResultsDialog" :visibility="sessionResultsDialog"
      :session="selectedSession" :round="selectedRound"
      @close="sessionResultsDialog = false"
    />
    <!-- ADD SESSION -->
    <add-session-dialog
      v-if="addSessionDialog" :visibility="addSessionDialog"
      :editingSession="editingSession" :round="selectedRound"
      :series="series" :editing="editing" :numSessions="loadedSessions.length"
      @close="addSessionDialog = false" @sessionAdded="sessionAdded"
    />
  </q-markup-table>
</template>

<style>
.no-padding-row {
  padding: 10 !important;
}
.sessions-thead {
  background-color: transparent !important;
}
.sessions-thead:hover {
  background-color: transparent !important;
}
.sessions-add {
  border-bottom: 0 !important;
}
</style>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'RoundTable',
  components: {
    sessionResults: () => import('components/Series/SessionResults.vue'),
    addSessionDialog: () => import('components/Series/AddSession.vue'),
  },
  props: {
    series: Object,
    loadedSeason: Array,
  },
  data() {
    return {
      roundToggle: null,
      sessionsLoading: false,
      sessionResultsDialog: false,
      addSessionDialog: false,
      loadedSessions: [],
      editingSession: null,
      editing: false,
      selectedSession: 0,
      selectedRound: null,
    };
  },
  methods: {
    editRound(round) {
      this.$emit('editRound', round);
    },
    toggleRound(id) {
      if (this.roundToggle === id) {
        this.roundToggle = null;
      } else {
        this.roundToggle = id;
        this.loadSessions(id);
      }
    },
    async loadSessions(id) {
      this.loadedSessions = [];
      this.sessionsLoading = true;
      await this.$axios
        .get(`/session/round/${id}`)
        .then((response) => {
          this.loadedSessions = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.sessionsLoading = false;
    },
    addSession(round) {
      this.editingSession = null;
      this.editing = false;
      this.selectedRound = round;
      this.addSessionDialog = true;
    },
    editSession(round, session) {
      this.editingSession = session;
      this.editing = true;
      this.selectedRound = round;
      this.addSessionDialog = true;
    },
    viewResults(round, session) {
      this.selectedSession = session;
      this.selectedRound = round;
      this.sessionResultsDialog = true;
    },
    sessionAdded() {
      this.loadSessions(this.selectedRound._id);
    },
  },
  computed: {
    editingAllowed() {
      return this.$store.getters.editingAllowed;
    },
  },
};
</script>
