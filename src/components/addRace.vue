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
          <div class="col q-pr-sm">
            <q-input
              outlined v-model="addRaceModel.round"
              autofocus type="number" label="Round"
              :rules="[ val => val && val > 0 && val < 100 || 'Please enter a round']"
            />
          </div>
          <div class="col q-pl-sm">
            <q-input
              outlined v-model="addRaceModel.number" type="number" label="Race Number"
              :rules="[ val => val && val > 0 && val < 10 || 'Please enter a race number']"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-select
          outlined v-model="addRaceModel.track" :options="loadedTracks"
          option-value="_id" option-label="name" label="Track" emit-value map-options
          :rules="[ val => val && val.length > 0 || 'Please select a track']"
        />
      </q-card-section>

      <q-card-section>
        <q-select
          outlined v-model="addRaceModel.pointsTable" :options="loadedPointsTables"
          option-value="_id" option-label="type" label="Points Table" emit-value map-options
          :rules="[ val => val && val.length > 0 || 'Please select a points table']"
        />
      </q-card-section>

      <q-card-section>
        <q-input
          outlined v-model="addRaceModel.type" label="Type"
          :rules="[ val => val && val.length > 0 || 'Please enter the type of race']"
        />
      </q-card-section>

      <q-card-section>
        <q-input
          outlined v-model="addRaceModel.configuration" label="Configuration"
          :rules="[ val => val && val.length > 0 || 'Please enter the track configuration']"
        />
      </q-card-section>

      <q-card-section>
        <q-input
          outlined v-model="addRaceModel.date" label="Date" mask="##-##-####"
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
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn
          flat label="Cancel"
          @click.stop="close"
        />
        <q-btn
          flat label="Save"
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
      await this.$axios
        .get('/track')
        .then((response) => {
          this.loadedTracks = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    async loadPointsTablesList() {
      await this.$axios
        .get('/points')
        .then((response) => {
          this.loadedPointsTables = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
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
          .then((result) => {
            this.$q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'fas fa-check-circle',
              message: 'Race added successfully!',
            });
            this.close();
            this.$emit('raceAdded', result.data);
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
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
          .then((result) => {
            this.$q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'fas fa-check-circle',
              message: 'Race added successfully!',
            });
            this.close();
            this.$emit('raceAdded', result.data);
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
          });
      }
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
      return this.addRaceModel.pointsTable != null && this.addRaceModel.pointsTable.length > 0
          && this.addRaceModel.track != null && this.addRaceModel.track.length > 0
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
