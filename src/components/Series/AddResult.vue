<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="width: 800px; max-width: 90vw;">

      <q-card-section>
        <div class="row">
          <div class="col-xs-9">
            <div class="text-h6">
              {{mode}} Position {{position}} Result
            </div>
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
        </div>
      </q-card-section>

      <q-card-section>

        <div class="row">
          <div class="col-xs-6 q-pr-xs">
            <!-- DRIVER -->
            <q-select
              outlined use-input v-model="selectedUser"
              :options="user_options" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="name" label="Driver"
              @filter="filterDrivers"
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
          <div class="col-xs-6 q-pl-xs">
            <!-- TEAM -->
            <q-select
              :options="loadedTeam"
              outlined v-model="addResultModel.team"
              option-value="_id" option-label="name"
              :dense="$q.screen.lt.sm" label="Team"
              disable disabled map-options emit-value
            >
              <template v-slot:append v-if="loadingTeam">
                <q-avatar>
                  <q-spinner
                    color="primary"
                    size="2em"
                  />
                </q-avatar>
              </template>
            </q-select>
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
          @click="deleteResult"
        />
        <q-btn
          flat label="Save"
          text-color="green"
          @click="save" :disabled="!addResultValidation"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */

export default {
  name: 'addResultDialog',
  props: {
    editing: Boolean,
    editingResult: Object,
    session: Object,
    round: Object,
    results: Array,
    visibility: Boolean,
  },
  data() {
    return {
      loadedTeam: null,
      loadedUsers: [],
      remainingDrivers: [],
      user_options: [],
      loadingTeam: false,
      loadingUsers: false,
      selectedUser: null,
      position: null,
      addResultModel: {
        user: null,
        team: null,
        session: null,
        series: null,
        season: null,
        position: null,
      },
    };
  },
  mounted() {
    this.calcPosition();
    this.loadUserList()
      .then(() => {
        if (this.editing === true) {
          this.selectedUser = this.editingResult.user;
          this.$forceUpdate();
        }
        this.addResultModel.position = this.editingResult.position;
        this.calcRemainingDrivers();
      });
  },
  methods: {

    calcRemainingDrivers() {
      const resultUserIDs = this.results.map(result => result.user._id);
      const filteredResults = this.loadedUsers.filter(user => resultUserIDs.indexOf(user._id) < 0);
      this.remainingDrivers = filteredResults;
      if (this.editing) {
        this.remainingDrivers.push(this.selectedUser);
      }
    },

    // Loads teams to autofill team field for driver
    async loadTeam() {
      this.loadingTeam = true;
      await this.$axios
        .get(`/team/user/${this.addResultModel.user}/season/${this.round.season}`)
        .then((response) => {
          this.addResultModel.team = response.data;
          this.loadedTeam = [response.data];
          console.log(this.loadedTeam);
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingTeam = false;
    },

    // Loads a list of available drivers
    async loadUserList() {
      this.loadingUsers = true;
      await this.$axios
        .get(`/team/drivers/${this.round.season}`)
        .then((response) => {
          this.loadedUsers = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingUsers = false;
    },

    // Autocomplete for driver list A
    filterDrivers(val, update) {
      if (val === '') {
        update(() => {
          this.user_options = this.remainingDrivers;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.user_options = this.remainingDrivers
          .filter(v => v.name.toLowerCase().indexOf(needle) > -1);
      });
    },

    // Chooses between edit and create mode
    async save() {
      if (this.editing === true) {
        await this.editResult();
      } else {
        await this.addResult();
      }
    },

    // Updates the result
    async editResult() {
      this.addResultModel.position = this.position;
      this.addResultModel.series = this.round.series;
      this.addResultModel.season = this.round.season;
      this.addResultModel.session = this.session._id;
      await this.$axios
        .patch(`/result/${this.editingResult._id}`, { model: this.addResultModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Result updated successfully!',
          });
          this.close();
          this.$emit('resultAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error updating result!',
          });
        });
    },

    // Creates a new result
    async addResult() {
      this.addResultModel.position = this.position;
      this.addResultModel.round = this.round._id;
      this.addResultModel.series = this.round.series;
      this.addResultModel.season = this.round.season;
      this.addResultModel.session = this.session._id;
      this.addResultModel.team = this.addResultModel.team._id;
      await this.$axios
        .post('/result', { model: this.addResultModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Result added successfully!',
          });
          this.close();
          this.$emit('resultAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error adding result!',
          });
        });
    },

    // Deletes the result
    async deleteResult() {
      await this.$axios
        .delete(`/result/${this.editingResult._id}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Result deleted successfully!',
          });
          this.close();
          this.$emit('resultAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error deleting result!',
          });
        });
    },

    // Checks to see if the number is an integer
    isInt(n) {
      return n % 1 === 0;
    },

    // Calculate current position
    calcPosition() {
      this.position = this.editingResult.position;
    },

    // Closes the dialog
    close() {
      this.$emit('close');
    },
  },
  computed: {
    // Validate form
    addResultValidation() {
      return this.addResultModel.user != null
        && this.addResultModel.team != null;
    },

    // Choose between 'Add' or 'Editing' mode
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
    },

    // Calculate result number
    resultNumber() {
      if (!this.editing) {
        return this.season.results.length + 1;
      }
      return this.editingResult.result;
    },
  },
  watch: {
    selectedUser(val) {
      this.addResultModel.user = val._id;
      this.loadTeam();
    },
  },
};
</script>
