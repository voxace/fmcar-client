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
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="New">
            <q-input
              outlined v-model="addNewTeamModel.name"
              label="Name" :dense="$q.screen.lt.sm"
              :rules="[ val => val && val.length > 0 || 'Please enter a name']"
            />
            <q-select
              outlined use-input v-model="addNewTeamModel.driver_a"
              :options="user_options" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="name" label="Driver A"
              emit-value map-options  @filter="filterFn"
              :rules="[ val => val != null || 'Please select a driver']"
            />
            <q-select
              outlined use-input v-model="addNewTeamModel.driver_b"
              :options="user_options" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="name" label="Driver B [Optional]"
              emit-value map-options  @filter="filterFn"
            />
          </q-tab-panel>
          <q-tab-panel name="Existing">
            <q-select
              outlined use-input v-model="addExistingTeamModel"
              :options="team_options" :dense="$q.screen.lt.sm"
              option-value="_id" option-label="name" label="Team"
              emit-value map-options  @filter="filterFn"
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
          @click="deleteTeam"
        />
        <q-btn
          flat label="Save"
          text-color="green"
          @click="addTeam" :disabled="!addRaceValidation"
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
      loadedSeries: [],
      loadedTeams: [],
      team_options: [],
      user_options: [],
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
    if (this.editing === true) {
      this.addNewTeamModel = this.editingTeam;
      this.$forceUpdate();
    }
  },
  methods: {
    filterFn(val, update) {
      if (val === '') {
        update(() => {
          this.options = this.loadedTeams;
        });
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.options = this.loadedTeams.filter(v => v.toLowerCase().indexOf(needle) > -1);
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
    async addTeam() {
      if (this.editing === true) {
        await this.$axios
          .patch(`/season/${this.season._id}/team/${this.addTeamModel}`)
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
              message: 'Error updating race!',
            });
          });
      } else {
        await this.$axios
          .post('/race', {
            // stuff
          })
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
              message: 'Error adding race!',
            });
          });
      }
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
    addRaceValidation() {
      return this.addTeamModel != null;
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
