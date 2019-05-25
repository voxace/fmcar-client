<template>
  <q-dialog
    v-model="visibility" persistent
    style="width: 700px; max-width: 90vw;"
  >
    <q-card style="min-width: 400px">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Team
        </div>
        <div class="text-subtitle2">
          Series: {{series.name}}
        </div>
        <div class="text-subtitle2">
          Season: {{season.season}}
        </div>
      </q-card-section>

      <q-card-section>
        <q-tabs
          v-if="!editing"
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="New" label="New" />
          <q-tab name="Existing" label="Existing" />
        </q-tabs>
        <q-separator v-if="!editing" />
        <q-tab-panels v-model="tab" animated>
          <!--- NEW TEAM --->
          <q-tab-panel name="New">
            <div class="row">
              <div class="col-xs-12">
                <q-input
                  outlined v-model="addNewTeamModel.name"
                  label="Name" :dense="$q.screen.lt.sm"
                  :rules="[ val => val && val.length > 0 || 'Please enter a name']"
                />
              </div>
              <div class="col-xs-12">
                <q-select
                  outlined use-input v-model="addNewTeamModel.car"
                  :options="loadedCars" :dense="$q.screen.lt.sm"
                  label="Car" option-value="car" option-label="car" emit-value
                  :rules="[ val => val != null || 'Please select a car']"
                  :disable="loadingCars" :disabled="loadingCars"
                >
                  <template v-slot:append v-if="loadingUsers">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-8">
                <q-select
                  outlined use-input v-model="addNewTeamModel.driver_a"
                  :options="user_options_a" :dense="$q.screen.lt.sm"
                  option-value="_id" option-label="name" label="Driver A"
                  emit-value map-options  @filter="filterDriversA"
                  :rules="[ val => val != null || 'Please select a driver']"
                  :disable="loadingUsers" :disabled="loadingUsers"
                >
                  <template v-slot:append v-if="loadingUsers">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-4 q-pl-sm">
                <q-input
                  v-model="addNewTeamModel.driver_a_num"
                  type="number" outlined
                  label="Number"
                  :dense="$q.screen.lt.sm"
                  :disable="loadingNumbers" :disabled="loadingNumbers"
                  :rules="[
                    val => checkNumber(val) || 'Already taken',
                    val => val >= 0 || 'Must be positive'
                  ]"
                >
                  <template v-slot:append v-if="loadingNumbers">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-input>
              </div>
              <div class="col-xs-8">
                <q-select
                  outlined use-input v-model="addNewTeamModel.driver_b"
                  :options="user_options_b" :dense="$q.screen.lt.sm"
                  option-value="_id" option-label="name" label="Driver B [Optional]"
                  emit-value map-options  @filter="filterDriversB"
                  :disable="loadingUsers" :disabled="loadingUsers"
                >
                  <template v-slot:append v-if="loadingUsers">
                    <q-avatar>
                      <q-spinner
                        color="primary"
                        size="2em"
                      />
                    </q-avatar>
                  </template>
                </q-select>
              </div>
              <div class="col-xs-4 q-pl-sm">
                <q-input
                  v-model="addNewTeamModel.driver_b_num"
                  type="number" outlined
                  label="Number"
                  :dense="$q.screen.lt.sm"
                  :disable="loadingNumbers" :disabled="loadingNumbers"
                  :rules="[
                    val => checkNumber(val) || 'Already taken',
                    val => val >= 0 || 'Must be positive'
                  ]"
                >
                  <template v-slot:append v-if="loadingNumbers">
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
          </q-tab-panel>
          <!--- EXISTING TEAM --->
          <q-tab-panel name="Existing">
            <q-select
              outlined use-input v-model="addExistingTeamModel"
              :options="team_options" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="name" label="Team"
              @filter="filterTeams" :rules="[ val => val != null || 'Please select a team']"
              :disable="loadingTeams" :disabled="loadingTeams"
            >
              <template v-slot:append v-if="loadingTeams">
                <q-avatar>
                  <q-spinner
                    color="primary"
                    size="2em"
                  />
                </q-avatar>
              </template>
            </q-select>
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
          @click="removeTeam"
        />
        <q-btn
          v-if="tab == 'New'"
          flat label="Save"
          text-color="green"
          @click="save"
          :disabled="!addTeamValidation"
        />
        <q-btn
          v-else
          flat label="Copy"
          text-color="green"
          @click="copyTeam"
          :disabled="addExistingTeamModel.name == null"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'addTeamDialog',
  props: {
    editing: Boolean,
    editingTeam: Object,
    series: Object,
    season: Object,
    visibility: Boolean,
  },
  data() {
    return {
      tab: 'New',
      driverNumbers: [],
      loadedTeams: [],
      loadedUsers: [],
      loadedCars: [],
      loadingNumbers: false,
      loadingTeams: false,
      loadingUsers: false,
      loadingCars: false,
      team_options: [],
      user_options_a: [],
      user_options_b: [],
      validNumbers: false,
      addExistingTeamModel: {
        name: null,
        season: null,
        series: null,
        car: null,
        driver_a: {
          _id: null,
          name: null,
        },
        driver_b: {
          _id: null,
          name: null,
        },
        driver_a_num: null,
        driver_b_num: null,
      },
      addNewTeamModel: {
        name: null,
        season: null,
        series: null,
        car: null,
        driver_a: {
          _id: null,
          name: null,
        },
        driver_b: {
          _id: null,
          name: null,
        },
        driver_a_num: null,
        driver_b_num: null,
      },
    };
  },
  mounted() {
    this.loadUserList();
    this.loadDriverNumbers();
    this.calculateAvailableCars();
    if (this.editing === true) {
      this.addNewTeamModel.name = this.editingTeam.name;
      this.addNewTeamModel.car = this.editingTeam.car;
      this.addNewTeamModel.driver_a = this.editingTeam.driver_a;
      this.addNewTeamModel.driver_b = this.editingTeam.driver_b;
      this.addNewTeamModel.driver_a_num = this.editingTeam.driver_a_num;
      this.addNewTeamModel.driver_b_num = this.editingTeam.driver_b_num;
      this.$forceUpdate();
    } else {
      this.loadTeamList();
    }
  },
  methods: {
    checkNumber(val) {
      if (this.driverNumbers.includes(Number(val))) {
        this.validNumbers = false;
        return false;
      }
      this.validNumbers = true;
      return true;
    },
    filterTeams(val, update) {
      if (val === '') {
        update(() => {
          this.team_options = this.loadedTeams;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.team_options = this.loadedTeams
          .filter(v => v.name.toLowerCase().indexOf(needle) > -1);
      });
    },
    filterDriversA(val, update) {
      if (val === '') {
        update(() => {
          this.user_options_a = this.loadedUsers;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.user_options_a = this.loadedUsers
          .filter(v => v.name.toLowerCase().indexOf(needle) > -1);
      });
    },
    filterDriversB(val, update) {
      if (val === '') {
        update(() => {
          this.user_options_b = this.loadedUsers;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.user_options_b = this.loadedUsers
          .filter(v => v.name.toLowerCase().indexOf(needle) > -1);
      });
    },
    async loadDriverNumbers() {
      this.loadingNumbers = true;
      await this.$axios
        .get(`/team/numbers/${this.season._id}`)
        .then((response) => {
          this.driverNumbers = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingNumbers = false;
    },
    async loadTeamList() {
      this.loadingTeams = true;
      await this.$axios
        .get(`/team/series/${this.series._id}`)
        .then((response) => {
          this.loadedTeams = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingTeams = false;
    },
    async loadUserList() {
      this.loadingUsers = true;
      await this.$axios
        .get('/user')
        .then((response) => {
          this.loadedUsers = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingUsers = false;
    },
    async save() {
      if (this.editing === true) {
        await this.editTeam();
      } else {
        await this.createTeam();
      }
    },
    async copyTeam() {
      // eslint-disable-next-line no-alert
      alert(this.addExistingTeamModel.driver_a);
      this.addNewTeamModel.name = this.addExistingTeamModel.name;
      this.addNewTeamModel.driver_a = this.addExistingTeamModel.driver_a;
      this.addNewTeamModel.driver_b = this.addExistingTeamModel.driver_b;
      this.addNewTeamModel.driver_a_num = this.addExistingTeamModel.driver_a_num;
      this.addNewTeamModel.driver_b_num = this.addExistingTeamModel.driver_b_num;
      this.tab = 'New';
    },
    async createTeam() {
      this.addNewTeamModel.series = this.series._id;
      this.addNewTeamModel.season = this.season._id;
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
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error creating team!',
          });
        });
    },
    async editTeam() {
      this.addNewTeamModel.series = this.series._id;
      this.addNewTeamModel.season = this.season._id;
      await this.$axios
        .patch(`/team/${this.editingTeam._id}`, { model: this.addNewTeamModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Team updated successfully!',
          });
          this.close();
          this.$emit('teamAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error updating team!',
          });
        });
    },
    async removeTeam() {
      await this.$axios
        .delete(`/team/${this.editingTeam._id}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Team deleted successfully!',
          });
          this.close();
          this.$emit('teamAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error deleting team!',
          });
        });
    },
    async calculateAvailableCars() {
      this.loadingCars = true;
      await this.$axios
        .get(`/team/cars/${this.season._id}`)
        .then((response) => {
          this.series.carChoices.forEach((carChoice) => {
            response.data.forEach((teamCar) => {
              if (carChoice.car === teamCar._id) {
                console.log(`Match: ${carChoice.car}`);
                console.log(`Limit: ${carChoice.limit}`);
                console.log(`Count: ${teamCar.count}`);
                if (carChoice.limit - teamCar.count > 0) {
                  this.loadedCars.push(carChoice);
                } else {
                  carChoice.disable = true;
                  this.loadedCars.push(carChoice);
                }
              }
            });
          });
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingCars = false;
    },
    close() {
      this.$emit('close');
    },
  },
  computed: {
    addTeamValidation() {
      return this.addNewTeamModel.name != null
        && this.addNewTeamModel.car != null
        && this.addNewTeamModel.name.length > 0
        && this.addNewTeamModel.driver_a != null
        && this.addNewTeamModel.driver_a_num > 0
        && this.validNumbers === true;
    },
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
    },
  },
};
</script>
