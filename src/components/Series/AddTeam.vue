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
          <q-tab-panel name="New">
            <q-input
              outlined v-model="addNewTeamModel.name"
              label="Name" :dense="$q.screen.lt.sm"
              :rules="[ val => val && val.length > 0 || 'Please enter a name']"
            />
            <q-select
              outlined use-input v-model="addNewTeamModel.driver_a"
              :options="user_options_a" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="name" label="Driver A"
              emit-value map-options  @filter="filterDriversA"
              :rules="[ val => val != null || 'Please select a driver']"
            />
            <q-select
              outlined use-input v-model="addNewTeamModel.driver_b"
              :options="user_options_b" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="name" label="Driver B [Optional]"
              emit-value map-options  @filter="filterDriversB"
            />
          </q-tab-panel>
          <q-tab-panel name="Existing">
            <q-select
              outlined use-input v-model="addExistingTeamModel"
              :options="team_options" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="name" label="Team"
              emit-value map-options  @filter="filterTeams"
              :rules="[ val => val != null || 'Please select a team']"
            />
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
          flat label="Save"
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
      loadedTeams: [],
      loadedUsers: [],
      team_options: [],
      user_options_a: [],
      user_options_b: [],
      addExistingTeamModel: null,
      addNewTeamModel: {
        name: null,
        driver_a: null,
        driver_b: null,
      },
    };
  },
  mounted() {
    this.loadTeamList();
    this.loadUserList();
    if (this.editing === true) {
      this.addNewTeamModel.name = this.editingTeam.name;
      this.addNewTeamModel.driver_a = this.editingTeam.driver_a;
      this.addNewTeamModel.driver_b = this.editingTeam.driver_b;
      this.$forceUpdate();
    }
  },
  methods: {
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
    async loadTeamList() {
      await this.$axios
        .get('/team')
        .then((response) => {
          this.loadedTeams = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    async loadUserList() {
      await this.$axios
        .get('/user')
        .then((response) => {
          this.loadedUsers = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    async save() {
      if (this.tab === 'New' && this.editing === true) {
        await this.editTeam();
      } else if (this.tab === 'New' && this.editing === false) {
        await this.createTeam();
      } else {
        await this.addTeam();
      }
    },
    async addTeam() {
      await this.$axios
        .patch(`/season/${this.season._id}/team/${this.addTeamModel}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Team added successfully!',
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
            message: 'Error adding team!',
          });
        });
    },
    async createTeam() {
      await this.$axios
        .post('/team', {
          name: this.addNewTeamModel.name,
          driver_a: this.addNewTeamModel.driver_a,
          driver_b: this.addNewTeamModel.driver_b,
          season: this.season,
        })
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
      await this.$axios
        .patch(`/team/${this.editingTeam._id}`, {
          name: this.addNewTeamModel.name,
          driver_a: this.addNewTeamModel.driver_a,
          driver_b: this.addNewTeamModel.driver_b,
        })
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
        .delete(`/team/${this.editingTeam}`)
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
    close() {
      this.$emit('close');
    },
  },
  computed: {
    addTeamValidation() {
      return this.addNewTeamModel.name != null
        && this.addNewTeamModel.driver_a != null
        && this.addNewTeamModel.name.length > 0;
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
