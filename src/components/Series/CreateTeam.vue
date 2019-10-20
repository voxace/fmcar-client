<template>
  <q-dialog
    v-model="visibility"
    persistent
    style="width: 700px; max-width: 90vw;"
  >
    <q-card style="min-width: 400px">

      <!--- HEADER --->
      <q-card-section>
        <div class="text-h6">
          Create Team
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

          <!--- DRIVER NAME --->
          <div class="col-xs-12">
            <q-input
              outlined
              readonly
              v-model="$store.state.user.name"
              label="Driver Name"
              :dense="$q.screen.lt.sm"
              :rules="[ val => val && val.length > 0 || 'Please enter a team name']"
            />
          </div>

          <!--- TEAM NAME --->
          <div class="col-xs-12">
            <q-input
              outlined
              v-model="addNewTeamModel.name"
              label="Team Name"
              :dense="$q.screen.lt.sm"
              :rules="[ val => val && val.length > 0 || 'Please enter a team name']"
            />
          </div>

          <!--- CAR CHOICE --->
          <div class="col-xs-8">
            <q-select
              v-if="loadedCars.length > 0"
              outlined
              use-input
              v-model="addNewTeamModel.car"
              :options="loadedCars"
              :dense="$q.screen.lt.sm"
              label="Car"
              option-value="car"
              option-label="car"
              emit-value
              :rules="[ val => val != null || 'Please select a car']"
              :disable="loadingCars"
              :disabled="loadingCars"
            >
              <template
                v-slot:append
                v-if="loadingCars"
              >
                <q-avatar>
                  <q-spinner
                    color="primary"
                    size="2em"
                  />
                </q-avatar>
              </template>
            </q-select>
            <q-input
              v-else
              outlined
              v-model="addNewTeamModel.car"
              label="Car"
              :dense="$q.screen.lt.sm"
              :rules="[ val => val && val.length > 0 || 'Please enter a car']"
            />
          </div>

          <!--- DRIVER A NUMBER --->
          <div class="col-xs-4 q-pl-sm">
            <q-input
              v-model="addNewTeamModel.driver_a_num"
              type="number"
              outlined
              label="Number"
              :dense="$q.screen.lt.sm"
              :disable="loadingNumbers"
              :disabled="loadingNumbers"
              :rules="[
                val => checkValid(val) || 'Enter a valid number',
                val => checkTaken(val, 'b') || 'Already taken',
              ]"
            >
              <template
                v-slot:append
                v-if="loadingNumbers"
              >
                <q-avatar>
                  <q-spinner
                    color="primary"
                    size="2em"
                  />
                </q-avatar>
              </template>
            </q-input>
          </div>

        </div>
      </q-card-section>

      <!--- ACTION BUTTONS --->
      <q-card-actions
        align="right"
        class="text-primary"
      >
        <q-btn
          flat
          label="Cancel"
          @click.stop="close"
        />
        <q-btn
          flat
          label="Save"
          text-color="green"
          @click="save"
          :disabled="!addTeamValidation"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'createTeamDialog',
  props: {
    series: Object,
    season: Object,
    visibility: Boolean,
  },
  data() {
    return {
      driverNumbers: [],
      loadedCars: [],
      loadingNumbers: false,
      loadingCars: false,
      validNumbers: false,
      addExistingTeamModel: {
        name: null,
        season: null,
        series: null,
        car: null,
        driver_a: null,
        driver_a_num: null,
      },
      addNewTeamModel: {
        name: null,
        season: null,
        series: null,
        car: null,
        driver_a: null,
        driver_a_num: null,
      },
    };
  },
  mounted() {
    this.loadDriverNumbers();
    this.calculateAvailableCars();
  },
  methods: {

    // Ensures driver cannot choose a taken number
    checkTaken(val, driver) {
      if (this.editingTeam) {
        if (Number(val) === this.editingTeam.driver_a_num
          && driver === 'a') {
          this.validNumbers = true;
          return true;
        }
      }
      if (this.driverNumbers.includes(Number(val))) {
        this.validNumbers = false;
        return false;
      }
      this.validNumbers = true;
      return true;
    },

    // Ensures driver cannot choose an invalid number
    checkValid(val) {
      if (val === null
        || val < 0
        || val > 9999
        || val === ''
        || !this.isInt(val)
      ) {
        this.validNumbers = false;
        return false;
      }
      this.validNumbers = true;
      return true;
    },

    // Checks to see if the number is an integer
    isInt(n) {
      return n % 1 === 0;
    },

    // Loads a list of driver numbers, which is then
    // used to calculate the available numbers
    async loadDriverNumbers() {
      this.loadingNumbers = true;
      await this.$axios
        .get(`/team/numbers/${this.season._id}`)
        .then((response) => {
          this.driverNumbers = response.data;
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error loading driver numbers!',
          });
        });
      this.loadingNumbers = false;
    },

    // Chooses between edit and create mode
    async save() {
      this.addNewTeamModel.series = this.series._id;
      this.addNewTeamModel.season = this.season._id;
      this.addNewTeamModel.driver_a = this.$store.state.user._id;
      await this.$axios
        .post('/team', { model: this.addNewTeamModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Team created successfully!',
          });
          this.close();
          this.$emit('teamAdded');
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error creating team!',
          });
        });
    },

    // Compares car limits defined in the series with
    // the number of cars chosen in teams so far to
    // determine the available cars left to choose
    async calculateAvailableCars() {
      this.loadingCars = true;
      await this.$axios
        .get(`/team/cars/${this.season._id}`)
        .then((response) => {
          this.series.carChoices.forEach((carChoice) => {
            if (response.data.length > 0) {
              let found = false;
              response.data.forEach((teamCar) => {
                if (carChoice.car === teamCar._id) {
                  found = true;
                  if (carChoice.limit != null && carChoice.limit !== 0) {
                    if (carChoice.limit - teamCar.count > 0) {
                      this.loadedCars.push(carChoice);
                    } else {
                      carChoice.disable = true;
                      this.loadedCars.push(carChoice);
                    }
                  } else {
                    this.loadedCars.push(carChoice);
                  }
                }
              });
              if (found === false) {
                this.loadedCars.push(carChoice);
              }
            } else {
              this.loadedCars = this.series.carChoices;
            }
          });
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error calculating available cars!',
          });
        });
      this.loadingCars = false;
    },

    // Closes the dialog
    close() {
      this.$emit('close');
    },
  },
  computed: {
    // Validate form
    addTeamValidation() {
      return this.addNewTeamModel.name != null
        && this.addNewTeamModel.car != null
        && this.addNewTeamModel.name.length > 0
        && this.addNewTeamModel.driver_a_num > 0
        && this.validNumbers === true;
    },
  },
};
</script>
