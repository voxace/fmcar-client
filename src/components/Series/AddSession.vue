<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="width: 900px; max-width: 90vw;">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Session {{ addSessionModel.sessionNumber }} {{ sessionName }}
        </div>
        <div class="text-subtitle2">
          Series: {{round.series.name}}
        </div>
        <div class="text-subtitle2">
          Round: {{round.round}}
        </div>
        <div class="text-subtitle2">
          Track: {{round.track.name}}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row">
          <!-- ROUND NUMBER -->
          <div class="col-xs-4 q-pr-xs">
            <q-input
              outlined v-model="addSessionModel.sessionNumber"
              type="number" label="Session" :dense="$q.screen.lt.sm"
              :rules="[
                val => val != null &&  val != '' || 'Enter a number',
                val => isInt(val) || 'Enter a whole number',
                val => val >= 0 || 'Must be 0 or larger',
                val => val <= 99 || 'Must be 99 or smaller'
              ]"
            />
          </div>
          <!-- DATE -->
          <div class="col-xs-4 q-px-xs" v-bind:class="{ 'q-pr-xs': $q.screen.gt.xs }">
            <q-input
              outlined v-model="addSessionModel.date"
              label="Date" mask="##-##-####" :dense="$q.screen.lt.sm"
              :rules="[ val => dateIsValid(val) || 'Please enter a valid date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-date v-model="addSessionModel.date" mask="DD-MM-YYYY" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <!-- TIME -->
          <div class="col-xs-4 q-pl-xs" v-bind:class="{ 'q-pl-xs': $q.screen.gt.xs }">
            <q-input
              outlined label="Time" v-model="addSessionModel.time"
              mask="time" :rules="['time']" :dense="$q.screen.lt.sm"
            >
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-time v-model="addSessionModel.time" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <!-- LAPS -->
          <div class="col-xs-4 q-pr-xs">
            <q-input
              outlined v-model="addSessionModel.laps"
              type="number" label="Laps" :dense="$q.screen.lt.sm"
              :rules="[
                val => val != null &&  val != '' || 'Enter a number',
                val => isInt(val) || 'Enter a whole number',
                val => val >= 0 || 'Must be 0 or larger',
                val => val <= 9999 || 'Must be 9999 or smaller'
              ]"
            />
          </div>
          <!-- SESSION TYPE -->
          <div class="col-xs-8 q-pl-xs">
            <q-select
              outlined v-model="addSessionModel.sessionType"
              :options="['Practice','Qualifying','Race']" :dense="$q.screen.lt.sm"
              label="Session Type" :rules="[ val => val != null || 'Select a session type']"
            />
          </div>
          <!-- POINTS TABLE -->
          <div class="col-xs-12 col-sm-6" v-bind:class="{ 'q-pr-xs': $q.screen.gt.xs }">
            <q-select
              outlined v-model="addSessionModel.pointsTable" label="Points Table"
              :options="availablePointsTables" :dense="$q.screen.lt.sm" clearable
              option-value="_id" option-label="type" emit-value map-options
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
          <div
            class="col-xs-12 col-sm-6" v-bind:class="{ 'q-pl-xs': $q.screen.gt.xs }"
            v-if="weatherOptions.length > 0"
          >
            <q-select
              label="Weather"
              outlined v-model="addSessionModel.weather" clearable
              :options="weatherOptions" :dense="$q.screen.lt.sm"
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
            class="col-xs-12 col-sm-6" v-bind:class="{ 'q-pl-xs': $q.screen.gt.xs }"
            v-else
          >
            <q-input
              outlined v-model="addSessionModel.weather"
              label="Weather" :dense="$q.screen.lt.sm"
            />
          </div>
        </div>
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
          @click="deleteSession"
        />
        <q-btn
          flat label="Save"
          text-color="green"
          @click="save" :disabled="!addSessionValidation"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import { date } from 'quasar';

export default {
  name: 'addSessionDialog',
  props: {
    editing: Boolean,
    round: Object,
    editingSession: Object,
    numSessions: Number,
    series: Object,
    visibility: Boolean,
  },
  data() {
    return {
      date,
      loadedTracks: [],
      loadedPointsTables: [],
      loadingTrack: false,
      loadingPointsTables: false,
      selectedTrack: null,
      weatherOptions: [],
      addSessionModel: {
        series: null,
        season: null,
        round: null,
        date: null,
        time: null,
        weather: null,
        laps: null,
        sessionType: null,
        sessionNumber: null,
        pointsTable: null,
      },
    };
  },
  mounted() {
    this.loadPointsTablesList();
    this.loadTrackList()
      .then(() => {
        if (this.editing === true) {
          this.addSessionModel.sessionNumber = this.editingSession.sessionNumber;
          this.addSessionModel.date = this.editingSession.date;
          this.addSessionModel.time = this.editingSession.time;
          this.addSessionModel.weather = this.editingSession.weather;
          this.addSessionModel.laps = this.editingSession.laps;
          this.addSessionModel.sessionType = this.editingSession.sessionType;
          this.addSessionModel.pointsTable = this.editingSession.pointsTable._id;
          this.$forceUpdate();
        } else {
          this.addSessionModel.sessionNumber = this.numSessions + 1;
        }
        this.getWeatherOptions();
      });
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
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error loading track list!',
          });
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
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error loading points tables!',
          });
        });
      this.loadingPointsTables = false;
    },

    // Chooses between edit and create mode
    async save() {
      if (this.editing === true) {
        await this.editSession();
      } else {
        await this.addSession();
      }
    },

    // Updates the round
    async editSession() {
      this.addSessionModel.series = this.round.series;
      this.addSessionModel.season = this.round.season;
      this.addSessionModel.round = this.round._id;
      await this.$axios
        .patch(`/session/${this.editingSession._id}`, { model: this.addSessionModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Session updated successfully!',
          });
          this.close();
          this.$emit('sessionAdded');
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error updating round!',
          });
        });
    },

    // Creates a new round
    async addSession() {
      this.addSessionModel.series = this.round.series;
      this.addSessionModel.season = this.round.season;
      this.addSessionModel.round = this.round._id;
      await this.$axios
        .post('/session', { model: this.addSessionModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Session added successfully!',
          });
          this.close();
          this.$emit('sessionAdded');
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error adding round!',
          });
        });
    },

    // Deletes the round
    async deleteSession() {
      await this.$axios
        .delete(`/session/${this.editingSession._id}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Session deleted successfully!',
          });
          this.close();
          this.$emit('roundAdded');
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error deleting round!',
          });
        });
    },

    // Checks to see if the number is an integer
    isInt(n) {
      return n % 1 === 0;
    },

    // Checks if the date is valid and in the right format
    dateIsValid(sessionDate) {
      if (sessionDate != null && sessionDate.length > 9) {
        const data = sessionDate.split('-');
        if (Date.parse(`${data[2]}-${data[1]}-${data[0]}`) > 0) {
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

    // Gets possible weather options based on the selected track
    getWeatherOptions() {
      if (this.round.track != null) {
        this.loadedTracks.forEach((track) => {
          if (track._id === this.round.track._id) {
            this.weatherOptions = track.weatherOptions;
          }
        });
      }
    },
  },
  computed: {
    // Validate form
    addSessionValidation() {
      return this.addSessionModel.sessionNumber != null
        && this.addSessionModel.sessionNumber > 0
        && this.addSessionModel.sessionType != null;
    },

    // Get session number for tab labels
    sessionName() {
      if (this.addSessionModel.sessionType != null) {
        return ` - ${this.addSessionModel.sessionType}`;
      }
      return '';
    },

    // Choose between 'Add' or 'Editing' mode
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
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
  },
};
</script>
