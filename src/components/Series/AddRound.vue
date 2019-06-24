<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="width: 900px; max-width: 90vw;">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Round {{ addRoundModel.round }}
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
          <!-- ROUND NUMBER -->
          <div class="col-xs-4 q-pr-sm">
            <q-input
              outlined v-model="addRoundModel.round"
              type="number" label="Round" :dense="$q.screen.lt.sm"
              :rules="[
                val => val != null &&  val != '' || 'Enter a number',
                val => isInt(val) || 'Enter a whole number',
                val => val >= 0 || 'Must be 0 or larger',
                val => val <= 99 || 'Must be 99 or smaller'
              ]"
            />
          </div>
          <div
            class="col-xs-8 q-pl-xs"
          >
            <!-- TRACK -->
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
          <div class="col-xs-6 q-pr-xs">
            <!-- ROUND TYPE -->
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
            class="col-xs-6 q-pl-xs"
          >
            <!-- CONFIGURATION -->
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
      loadedTracks: [],
      loadingTrack: false,
      selectedTrack: null,
      trackConfigurations: [],
      addRoundModel: {
        series: this.series._id,
        season: this.season._id,
        round: null,
        track: null,
        roundType: null,
        configuration: null,
      },
    };
  },
  mounted() {
    this.loadTrackList()
      .then(() => {
        if (this.editing === true) {
          this.addRoundModel.round = this.editingRound.round;
          this.addRoundModel.track = this.editingRound.track._id;
          this.addRoundModel.roundType = this.editingRound.roundType;
          this.addRoundModel.configuration = this.editingRound.configuration;
          this.$forceUpdate();
        } else {
          this.addRoundModel.round = this.season.rounds.length + 1;
        }
        this.getTrackConfigurations();
      });
  },
  methods: {

    // Checks to see if the number is an integer
    isInt(n) {
      return n % 1 === 0;
    },

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

    // Closes the dialog
    close() {
      this.$emit('close');
    },

    // Clears the options based on track data and reloads them
    trackChanged() {
      this.addRoundModel.configuration = null;
      this.getTrackConfigurations();
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
  },
  computed: {
    // Validate form
    addRoundValidation() {
      return this.addRoundModel.track != null;
    },

    // Choose between 'Add' or 'Editing' mode
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
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
