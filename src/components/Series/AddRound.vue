<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="width: 900px; max-width: 90vw;">

      <q-card-section>
        <div class="row">
          <div class="col-xs-9">
            <div class="text-h6">
              {{mode}} Round {{ roundNumber }}
            </div>
            <div class="text-subtitle2">
              Series: {{series.name}}
            </div>
            <div class="text-subtitle2">
              Season: {{season.season}}
            </div>
          </div>
          <div class="col-xs-3 q-pt-lg">
            <q-btn
              v-if="$q.screen.gt.md"
              icon="add" class="full-width" color="primary"
              label="Add Session" @click="addSession"
            />
            <q-btn
              v-else-if="$q.screen.gt.xs"
              class="full-width" color="primary"
              label="Add Session" @click="addSession"
            />
            <q-btn
              v-if="$q.screen.lt.sm"
              class="full-width" color="primary"
              icon="add" @click="addSession"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>

        <!-- TABS -->
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="info" label="Round Details" />
          <q-tab
            v-for="(session, i) in addRoundModel.sessions"
            :name="i"
            :label="sessionName(session, i)"
            :key="i"
          />
        </q-tabs>
        <q-separator v-if="!editing" />
        <q-tab-panels v-model="tab" animated>

          <!--- ROUND INFO --->
          <q-tab-panel name="info">
            <div class="row">
              <div
                class="col-xs-12"
              >
                <q-select
                  outlined v-model="addRoundModel.track" map-options
                  :options="trackOptions" :dense="$q.screen.lt.sm"
                  option-value="_id" option-label="name" label="Track" emit-value
                  :rules="[ val => val != null || 'Please select a track']"
                  :disable="loadingTrack" :disabled="loadingTrack"
                  @input="trackChanged"
                >
                  <template v-slot:append v-if="loadingTrack">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-12">
                <q-select
                  outlined v-model="addRoundModel.roundType"
                  :options="series.roundTypes" :dense="$q.screen.lt.sm"
                  option-value="name" option-label="name" label="Round Type" emit-value map-options
                  :rules="[ val => val != null || 'Please select a round type']"
                >
                  <template v-slot:append v-if="loadingTrack">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-select>
              </div>
              <div
                class="col-xs-12"
              >
                <q-select
                  v-if="trackConfigurations.length > 0" label="Configuration"
                  outlined v-model="addRoundModel.configuration"
                  :options="trackConfigurations" :dense="$q.screen.lt.sm"
                  :disable="addRoundModel.track == null" :disabled="addRoundModel.track == null"
                >
                  <template v-slot:append v-if="loadingTrack">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-select>
                <q-input
                  v-else outlined v-model="addRoundModel.configuration"
                  label="Configuration" :dense="$q.screen.lt.sm"
                  :disable="addRoundModel.track == null" :disabled="addRoundModel.track == null"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- SESSIONS -->
          <q-tab-panel
            v-for="(session, i) in addRoundModel.sessions"
            :name="i"
            :key="i"
          >
            <div class="row">
              <!-- DATE -->
              <div class="col-xs-12">
                <q-input
                  outlined v-model="session.date"
                  label="Date" mask="##-##-####" :dense="$q.screen.lt.sm"
                  :rules="[ val => dateIsValid(val) || 'Please enter a valid date']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-date v-model="session.date" mask="DD-MM-YYYY" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <!-- TIME -->
              <div class="col-xs-12">
                <q-input
                  outlined label="Time" v-model="session.time"
                  mask="time" :rules="['time']" :dense="$q.screen.lt.sm"
                >
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="session.time" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <!-- LAPS -->
              <div class="col-xs-4 q-pr-sm">
                <q-input
                  outlined v-model="session.laps"
                  type="number" label="Laps" :dense="$q.screen.lt.sm"
                  :rules="[ val => val && val > 0 && val < 1000 || 'Enter number of laps']"
                />
              </div>
              <!-- SESSION TYPE -->
              <div class="col-xs-8 q-pl-sm">
                <q-select
                  outlined v-model="session.sessionType"
                  :options="['Practice','Qualifying','Race']" :dense="$q.screen.lt.sm"
                  label="Session Type" :rules="[ val => val != null || 'Select a session type']"
                />
              </div>
              <!-- POINTS TABLE -->
              <div class="col-xs-12">
                <q-select
                  outlined v-model="session.pointsTable" label="Points Table"
                  :options="availablePointsTables" :dense="$q.screen.lt.sm"
                  option-value="_id" option-label="type" emit-value map-options
                  :rules="[ val => val && val.length > 0 || 'Select a points table']"
                  :disable="loadingPointsTables" :disabled="loadingPointsTables"
                >
                  <template v-slot:append v-if="loadingPointsTables">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-select>
              </div>
              <!-- WEATHER -->
              <div class="col-xs-12" v-if="weatherOptions.length > 0">
                <q-select
                  label="Weather"
                  outlined v-model="session.weather"
                  :options="weatherOptions" :dense="$q.screen.lt.sm"
                  :disable="addRoundModel.track == null" :disabled="addRoundModel.track == null"
                >
                  <template v-slot:append v-if="loadingTrack">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-12" v-else>
                <q-input
                  outlined v-model="session.weather"
                  label="Weather" :dense="$q.screen.lt.sm"
                  :disable="addRoundModel.track == null" :disabled="addRoundModel.track == null"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn
          flat label="Cancel"
          @click.stop="close"
        />
        <q-btn
          v-if="editing"
          flat label="Delete"
          text-color="red"
          @click="deleteRound"
        />
        <q-btn
          flat label="Save"
          text-color="green"
          @click="save" :disabled="!addRoundValidation"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style>
.q-tabs--not-scrollable .q-tabs__arrow {
  display: block;
}
</style>

<script>
/* eslint-disable no-underscore-dangle */
import { date } from 'quasar';

export default {
  name: 'addRoundDialog',
  props: {
    editing: Boolean,
    editingRound: Object,
    series: Object,
    season: Object,
    visibility: Boolean,
  },
  data() {
    return {
      date,
      tab: 'info',
      years: ['2019'],
      loadedSeries: [],
      loadedTracks: [],
      loadedPointsTables: [],
      loadingTrack: false,
      loadingPointsTables: false,
      selectedTrack: null,
      trackConfigurations: [],
      weatherOptions: [],
      addRoundModel: {
        series: this.series._id,
        season: this.season._id,
        round: null,
        track: null,
        roundType: null,
        configuration: null,
        sessions: [{
          date: null,
          time: null,
          weather: null,
          laps: null,
          sessionType: null,
          pointsTable: null,
        }],
      },
    };
  },
  mounted() {
    this.getToday();
    this.loadTrackList();
    this.loadPointsTablesList();
    this.getTrackConfigurations();
    this.getWeatherOptions();
    if (this.editing === true) {
      this.addRoundModel.round = this.editingRound.round;
      this.addRoundModel.track = this.editingRound.track;
      this.addRoundModel.roundType = this.editingRound.roundType;
      this.addRoundModel.configuration = this.editingRound.configuration;
      this.addRoundModel.sessions = this.editingRound.sessions;
      this.$forceUpdate();
    }
  },
  methods: {
    // Load tracks
    async loadTrackList() {
      this.loadingTrack = true;
      await this.$axios
        .get('/track')
        .then((response) => {
          this.loadedTracks = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingTrack = false;
    },

    // Load points tables
    async loadPointsTablesList() {
      this.loadingPointsTables = true;
      await this.$axios
        .get('/points')
        .then((response) => {
          this.loadedPointsTables = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingPointsTables = false;
    },

    // Add session
    addSession() {
      this.addRoundModel.sessions.push({
        date: null,
        time: null,
        weather: null,
        laps: null,
        sessionType: null,
        pointsTable: null,
      });
      setTimeout(() => {
        this.tab = this.addRoundModel.sessions.length - 1;
        document.getElementsByClassName('q-tabs__content')[1].scrollTo({
          top: 0,
          left: 1000,
          behavior: 'smooth',
        });
        document.getElementsByClassName('q-tabs__arrow--right')[1].click();
      }, 50);
    },

    // Chooses between edit and create mode
    async save() {
      if (this.editing === true) {
        await this.editRound();
      } else {
        await this.addRound();
      }
    },

    // Updates the round
    async editRound() {
      this.addRoundModel.series = this.series._id;
      this.addRoundModel.season = this.season._id;
      await this.$axios
        .patch(`/round/${this.editingRound._id}`, { model: this.addRoundModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Round updated successfully!',
          });
          this.close();
          this.$emit('roundAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error updating round!',
          });
        });
    },

    // Creates a new round
    async addRound() {
      this.addRoundModel.series = this.series._id;
      this.addRoundModel.season = this.season._id;
      this.addRoundModel.round = this.roundNumber;
      await this.$axios
        .post('/round', { model: this.addRoundModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Round added successfully!',
          });
          this.close();
          this.$emit('roundAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error adding round!',
          });
        });
    },

    // Deletes the round
    async deleteRound() {
      await this.$axios
        .delete(`/round/${this.editingRound._id}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Round deleted successfully!',
          });
          this.close();
          this.$emit('roundAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error deleting round!',
          });
        });
    },

    // Gets today's date in the correct format
    getToday() {
      const timeStamp = Date.now();
      this.addRoundModel.date = date.formatDate(timeStamp, 'DD-MM-YYYY');
      this.rawDate = date.formatDate(timeStamp, 'YYYY/MM/DD');
    },

    // Checks if the date is valid and in the right format
    dateIsValid(sessionDate) {
      if (sessionDate != null && sessionDate.length > 9) {
        const data = sessionDate.split('-');
        if (Date.parse(`${data[2]}-${data[1]}-${data[0]}`) > 0) {
          this.rawDate = `${data[2]}/${data[1]}/${data[0]}`;
          return true;
        }
        return false;
      }
      return false;
    },

    // Closes the dialog
    close() {
      this.$emit('close');
    },

    // Clears the options based on track data and reloads them
    trackChanged() {
      this.addRoundModel.weather = null;
      this.addRoundModel.configuration = null;
      this.getTrackConfigurations();
      this.getWeatherOptions();
    },

    // Gets possible track configurations based on the selected track
    getTrackConfigurations() {
      if (this.addRoundModel.track != null) {
        this.loadedTracks.forEach((track) => {
          if (track._id === this.addRoundModel.track) {
            this.trackConfigurations = track.configurations;
          }
        });
      }
    },

    // Gets possible weather options based on the selected track
    getWeatherOptions() {
      if (this.addRoundModel.track != null) {
        this.loadedTracks.forEach((track) => {
          if (track._id === this.addRoundModel.track) {
            this.weatherOptions = track.weatherOptions;
          }
        });
      }
    },

    // Get session number for tab labels
    sessionName(session, i) {
      if (session.sessionType != null) {
        return `Session ${i + 1}: ${session.sessionType}`;
      }
      return `Session ${i + 1}`;
    },
  },
  computed: {
    // Validate form
    addRoundValidation() {
      return this.addRoundModel.track != null;
      // && this.addRoundModel.roundType != null && this.addRoundModel.roundType.length > 0
      // && this.addRoundModel.date != null && this.addRoundModel.date.length > 0;
    },

    // Choose between 'Add' or 'Editing' mode
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
    },

    // Calculate round number
    roundNumber() {
      if (!this.editing) {
        return this.season.rounds.length + 1;
      }
      return this.editingRound.round;
    },

    // Displays only the points tables that are selected in the series
    availablePointsTables() {
      const tables = [];
      if (this.loadedPointsTables != null) {
        this.loadedPointsTables.forEach((table) => {
          this.series.pointsTables.forEach((seriesTable) => {
            if (table._id === seriesTable) {
              tables.push(table);
            }
          });
        });
      }
      return tables;
    },

    // All tracks are available if none are set for the game
    trackOptions() {
      if (this.series.game.tracks != null && this.series.game.tracks.length === 0) {
        return this.loadedTracks;
      }
      // Filters loaded tracks by the object id of the tracks in the series
      return this.loadedTracks.filter(o => !this.series.game.tracks.find(o2 => o._id === o2));
    },
  },
};
</script>
