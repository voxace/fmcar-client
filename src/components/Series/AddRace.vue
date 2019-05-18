<template>
  <q-dialog
    v-model="visibility" persistent
    style="width: 700px; max-width: 90vw;"
  >
    <q-card style="min-width: 400px">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Race
        </div>
        <div class="text-subtitle2">
          Series: {{series.name}}
        </div>
        <div class="text-subtitle2">
          Season: {{season.season}}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row">
          <div class="col-xs-4 q-pr-sm">
            <q-input
              outlined v-model="addRaceModel.round"
              autofocus type="number" label="Round" :dense="$q.screen.lt.sm"
              :rules="[ val => val && val > 0 && val < 100 || 'Please enter a round']"
            />
          </div>
          <div class="col-xs-4 q-px-sm">
            <q-input
              outlined v-model="addRaceModel.number" type="number"
              label="Race Number" :dense="$q.screen.lt.sm"
              :rules="[ val => val && val > 0 && val < 10 || 'Please enter a race number']"
            />
          </div>
          <div class="col-xs-4 q-pl-sm">
            <q-input
              outlined v-model="addRaceModel.date"
              label="Date" mask="##-##-####" :dense="$q.screen.lt.sm"
              :rules="[ val => dateIsValid() || 'Please enter a valid date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-date v-model="rawDate" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-xs-6 q-pr-sm">
            <q-select
              outlined v-model="addRaceModel.track"
              :options="loadedTracks" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="name" label="Track" emit-value map-options
              :rules="[ val => val != null || 'Please select a track']"
              :disable="loadingTrack" :disabled="loadingTrack"
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
          <div class="col-xs-6 q-pl-sm">
            <q-select
              outlined v-model="addRaceModel.pointsTable"
              :options="loadedPointsTables" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="type" label="Points Table" emit-value map-options
              :rules="[ val => val && val.length > 0 || 'Please select a points table']"
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
          <div
            class="col-xs-6 col-sm-12"
            v-bind:class="{ 'q-pr-sm': $q.screen.lt.sm }"
          >
            <q-input
              outlined v-model="addRaceModel.type"
              label="Type" :dense="$q.screen.lt.sm"
              :rules="[ val => val && val.length > 0 || 'Please enter the type of race']"
            />
          </div>
          <div
            class="col-xs-6 col-sm-12"
            v-bind:class="{ 'q-pl-sm': $q.screen.lt.sm }"
          >
            <q-input
              outlined v-model="addRaceModel.configuration"
              label="Configuration" :dense="$q.screen.lt.sm"
              :rules="[ val => val && val.length > 0 || 'Please enter the track configuration']"
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
          @click="deleteRace"
        />
        <q-btn
          flat label="Save"
          text-color="green"
          @click="addRace" :disabled="!addRaceValidation"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style>
</style>

<script>
/* eslint-disable no-underscore-dangle */
import { date } from 'quasar';

export default {
  name: 'addRaceDialog',
  props: {
    editing: Boolean,
    editingRace: Object,
    series: Object,
    season: Object,
    visibility: Boolean,
  },
  data() {
    return {
      date,
      rawDate: null,
      years: ['2019'],
      loadedSeries: [],
      loadedTracks: [],
      loadedPointsTables: [],
      loadingTrack: false,
      loadingPointsTables: false,
      addRaceModel: {
        pointsTable: null,
        track: null,
        round: null,
        number: null,
        type: null,
        configuration: null,
        date: null,
      },
    };
  },
  mounted() {
    this.getToday();
    this.loadTrackList();
    this.loadPointsTablesList();
    if (this.editing === true) {
      this.addRaceModel.pointsTable = this.editingRace.pointsTable;
      this.addRaceModel.track = this.editingRace.track;
      this.addRaceModel.round = this.editingRace.round;
      this.addRaceModel.number = this.editingRace.number;
      this.addRaceModel.type = this.editingRace.type;
      this.addRaceModel.configuration = this.editingRace.configuration;
      this.addRaceModel.date = this.editingRace.date;
      this.$forceUpdate();
    }
  },
  methods: {
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
    async addRace() {
      if (this.editing === true) {
        await this.$axios
          .patch(`/race/${this.editingRace._id}`, {
            series: this.series._id,
            season: this.season._id,
            pointsTable: this.addRaceModel.pointsTable,
            track: this.addRaceModel.track,
            round: this.addRaceModel.round,
            number: this.addRaceModel.number,
            type: this.addRaceModel.type,
            configuration: this.addRaceModel.configuration,
            date: this.addRaceModel.date,
          })
          .then(() => {
            this.$q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'fas fa-check-circle',
              message: 'Race updated successfully!',
            });
            this.close();
            this.$emit('raceAdded');
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
            this.$q.notify({
              color: 'red-4',
              textColor: 'white',
              icon: 'fas fa-cross-circle',
              message: 'Error updating race!',
            });
          });
      } else {
        await this.$axios
          .post('/race', {
            series: this.series._id,
            season: this.season._id,
            pointsTable: this.addRaceModel.pointsTable,
            track: this.addRaceModel.track,
            round: this.addRaceModel.round,
            number: this.addRaceModel.number,
            type: this.addRaceModel.type,
            configuration: this.addRaceModel.configuration,
            date: this.addRaceModel.date,
          })
          .then(() => {
            this.$q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'fas fa-check-circle',
              message: 'Race added successfully!',
            });
            this.close();
            this.$emit('raceAdded');
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
            this.$q.notify({
              color: 'red-4',
              textColor: 'white',
              icon: 'fas fa-cross-circle',
              message: 'Error adding race!',
            });
          });
      }
    },
    async deleteRace() {
      await this.$axios
        .delete(`/race/${this.editingRace._id}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Race deleted successfully!',
          });
          this.close();
          this.$emit('raceAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error deleting race!',
          });
        });
    },
    getToday() {
      const timeStamp = Date.now();
      this.addRaceModel.date = date.formatDate(timeStamp, 'DD-MM-YYYY');
      this.rawDate = date.formatDate(timeStamp, 'YYYY/MM/DD');
    },
    dateIsValid() {
      if (this.addRaceModel.date != null && this.addRaceModel.date.length > 9) {
        const data = this.addRaceModel.date.split('-');
        if (Date.parse(`${data[2]}-${data[1]}-${data[0]}`) > 0) {
          this.rawDate = `${data[2]}/${data[1]}/${data[0]}`;
          return true;
        }
        return false;
      }
      return false;
    },
    close() {
      this.$emit('close');
    },
  },
  computed: {
    addRaceValidation() {
      return this.addRaceModel.pointsTable != null && this.addRaceModel.track != null
          && this.addRaceModel.round > 0 && this.addRaceModel.number > 0
          && this.addRaceModel.type != null && this.addRaceModel.type.length > 0
          && this.addRaceModel.configuration != null && this.addRaceModel.configuration.length > 0
          && this.addRaceModel.date != null && this.addRaceModel.date.length > 0;
    },
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
    },
  },
  watch: {
    rawDate(val) {
      this.addRaceModel.date = date.formatDate(new Date(val), 'DD-MM-YYYY');
    },
  },
};
</script>
