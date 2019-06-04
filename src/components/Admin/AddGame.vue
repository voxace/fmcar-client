<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="min-width: 400px; width: 700px; max-width: 90vw;">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Game
        </div>
      </q-card-section>

      <q-card-section style="max-height: 600px;">
        <div class="row">
          <div class="col-xs-12">
            <q-input
              outlined v-model="addNewGameModel.name"
              label="Name" :dense="$q.screen.lt.sm"
              :rules="[ val => val && val.length > 0 || 'Please enter a name']"
            />
          </div>
          <div
            class="col-xs-12"
          >
            <q-select
              outlined v-model="addNewGameModel.tracks" use-input emit-value
              :options="trackOptions" :dense="$q.screen.lt.sm" use-chips
              multiple input-debounce="0" new-value-mode="add-unique"
              option-value="_id" option-label="name" label="Tracks"
              :rules="[ val => val.length > 0 || 'Please choose the tracks available in the game']"
              :disable="loadingTrack" :disabled="loadingTrack" @filter="filterTracks"
            >
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  dense
                  @remove="scope.removeAtIndex(scope.index)"
                  :tabindex="scope.tabindex"
                >
                  {{ mappedModel[scope.opt] }}
                </q-chip>
              </template>
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
          <div v-if="showImage" class="col-xs-12">
            <q-img
              class="rounded-borders cursor-pointer"
              :src="getUrl"
              :ratio="16/9"
              @click="editingGame.logo = null; imageUpload = 'delete'"
            >
              <q-tooltip
                class="round"
                anchor="center middle"
                self="center middle"
                content-class="bg-transparent"
              >
                <q-btn round color="red" size="lg" icon="delete" />
              </q-tooltip>
            </q-img>
          </div>

          <div v-else class="col-xs-12">
            <q-uploader
              label="Game Image / Logo"
              auto-upload flat bordered
              accept=".jpg, image/*"
              field-name="upload"
              :url="uploadUrl"
              style="width: 100%"
              @uploaded="uploaded"
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
          flat label="Save"
          text-color="green"
          @click="save"
          :disabled="!addGameValidation"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'addGameDialog',
  props: {
    editing: Boolean,
    editingGame: Object,
    visibility: Boolean,
  },
  data() {
    return {
      uploadUrl: `${process.env.API}/upload`,
      imageUpload: null,
      loadedTracks: [],
      trackOptions: [],
      loadingTrack: false,
      addExistingGameModel: {
        name: null,
        tracks: [],
        logo: null,
      },
      addNewGameModel: {
        name: null,
        tracks: [],
        logo: null,
      },
    };
  },
  async mounted() {
    this.loadTrackList();
  },
  methods: {

    // Provides file name info on upload
    uploaded(info) {
      this.imageUpload = info.xhr.response;
    },

    // Autocomplete for tracks list
    filterTracks(val, update) {
      if (val === '') {
        update(() => {
          this.trackOptions = this.loadedTracks;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.trackOptions = this.loadedTracks
          .filter(v => v.name.toLowerCase().includes(needle));
      });
    },

    // Chooses between edit and create mode
    async save() {
      if (this.editing === true) {
        await this.editGame();
      } else {
        await this.addGame();
      }
    },

    // Creates a new game
    async addGame() {
      await this.$axios
        .post('/game', {
          model: this.addNewGameModel,
          upload: this.imageUpload,
        })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Game created successfully!',
          });
          this.close();
          this.$emit('gameAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error creating game!',
          });
        });
    },

    // Updates the game
    async editGame() {
      await this.$axios
        .patch(`/game/${this.editingGame._id}`, {
          model: this.addNewGameModel,
          upload: this.imageUpload,
        })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Game updated successfully!',
          });
          this.close();
          this.$emit('gameAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error updating game!',
          });
        });
    },

    // Load tracks
    async loadTrackList() {
      this.loadingTrack = true;
      await this.$axios
        .get('/track')
        .then((response) => {
          this.loadedTracks = response.data;
          if (this.editing === true) {
            this.addNewGameModel.name = this.editingGame.name;
            this.addNewGameModel.tracks = this.editingGame.tracks.map(track => track._id);
            this.addNewGameModel.logo = this.editingGame.logo;
            this.$forceUpdate();
          }
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingTrack = false;
    },

    // Closes the dialog
    close() {
      this.$emit('close');
    },
  },
  computed: {

    // Validate form
    addGameValidation() {
      return this.addNewGameModel.name != null
      && this.addNewGameModel.name.length > 0;
    },

    // Choose between 'Add' or 'Editing' mode
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
    },

    // Show image instead of uploader
    showImage() {
      if (this.editing === true && this.editingGame.logo != null) {
        return true;
      }
      return false;
    },

    // Get image URL
    getUrl() {
      return `${process.env.BASE}/${this.editingGame.logo}`;
    },

    // Manually map options
    mappedModel() {
      return this.loadedTracks.reduce((acc, o) => {
        acc[o._id] = o.name;
        return acc;
      }, {});
    },
  },
};
</script>
