<template>
  <q-dialog
    v-model="visibility" persistent
    style="width: 700px; max-width: 90vw;"
  >
    <q-card style="min-width: 400px">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Season {{ getNextSeason }}:
        </div>
        <div class="text-subtitle2">
          Series: {{series.name}}
        </div>
      </q-card-section>

      <q-card-section v-if="!editing">
        <q-checkbox v-model="copyRaces" label="Copy races from another season?" />
      </q-card-section>

      <q-slide-transition>
        <div v-if="copyRaces == true">
          <q-card-section v-show="copyRaces == true">
            <q-select
              outlined v-model="seasonToCopy" :options="series.seasons"
              option-value="_id" option-label="season" label="Season" emit-value map-options
              :rules="[ val => val && val.length > 0 || 'Please select a season']"
            />
          </q-card-section>
        </div>
      </q-slide-transition>

      <q-card-actions align="right" class="text-primary">
        <q-btn
          flat label="Cancel"
          @click.stop="close"
        />
        <q-btn
          v-if="editing"
          flat label="Delete"
          text-color="red"
          @click="deleteSeason"
        />
        <q-btn
          v-else
          flat label="Save"
          text-color="green"
          @click="addSeason"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style>
</style>

<script>
/* eslint-disable no-underscore-dangle */

export default {
  name: 'addSeasonDialog',
  props: {
    editing: Boolean,
    editingSeason: Object,
    series: Object,
    visibility: Boolean,
  },
  data() {
    return {
      copyRaces: false,
      seasonToCopy: null,
    };
  },
  methods: {
    async addSeason() {
      if (this.copyRaces !== true) {
        await this.$axios
          .post('/season', {
            series: this.series._id,
            season: this.series.seasons.length + 1,
          })
          .then((response) => {
            this.$q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'fas fa-check-circle',
              message: 'Season added successfully!',
            });
            this.close();
            this.$emit('seasonAdded', response.data);
          })
          .catch(() => {
            this.$q.notify({
              color: 'red-4',
              textColor: 'white',
              icon: 'fas fa-cross-circle',
              message: 'Error adding season!',
            });
          });
      } else {
        await this.$axios
          .post('/season/copy', {
            series: this.series._id,
            season: this.series.seasons.length + 1,
            oldSeason: this.seasonToCopy,
          })
          .then((response) => {
            this.$q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'fas fa-check-circle',
              message: 'Season duplicated successfully!',
            });
            this.close();
            this.$emit('seasonAdded', response.data);
          })
          .catch(() => {
            this.$q.notify({
              color: 'red-4',
              textColor: 'white',
              icon: 'fas fa-cross-circle',
              message: 'Error adding season!',
            });
          });
      }
    },
    async deleteSeason() {
      await this.$axios
        .delete(`/season/${this.editingSeason._id}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Season deleted successfully!',
          });
          this.close();
          this.$emit('seasonDeleted');
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error deleting season!',
          });
        });
    },
    close() {
      this.$emit('close');
    },
  },
  computed: {
    getNextSeason() {
      if (this.editing === true) {
        return this.editingSeason.season;
      }
      if (this.series.seasons) {
        return this.series.seasons.length + 1;
      }
      return 1;
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
