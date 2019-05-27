<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="width: 700px; max-width: 90vw; min-width: 400px">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Track
        </div>
      </q-card-section>

      <q-card-section
        style="max-height: 600px;"
        ref="trackWindow" class="scroll"
      >
        <!-- TABS -->
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="main" label="Main" />
          <q-tab name="config" label="Configurations" />
          <q-tab name="weather" label="Weather" />
        </q-tabs>
        <q-separator v-if="!editing" />
        <q-tab-panels v-model="tab" animated>

          <!--- MAIN --->
          <q-tab-panel name="main">
            <div class="row">
              <div class="col-xs-12">
                <q-input
                  outlined v-model="addNewTrackModel.name"
                  label="Name" :dense="$q.screen.lt.sm"
                  :rules="[ val => val && val.length > 0 || 'Please enter a name']"
                />
              </div>
              <div v-if="showImage" class="col-xs-12">
                <q-img
                  class="rounded-borders cursor-pointer"
                  :src="getUrl"
                  :ratio="16/9"
                  @click="editingTrack.image = null; imageUpload = 'delete'"
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
                  label="Track Image / Logo"
                  auto-upload flat bordered
                  accept=".jpg, image/*"
                  field-name="upload"
                  :url="uploadUrl"
                  style="width: 100%"
                  @uploaded="uploaded"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- CONFIGURATIONS -->
          <q-tab-panel name="config">
            <div class="row">
              <div class="col-xs-12">
                <transition
                  v-for="(value, i) in addNewTrackModel.configurations" :key="i"
                  appear
                  enter-active-class="animated zoomIn slow-transition"
                  leave-active-class="animated zoomOut slow-transition"
                >
                  <div
                    class="row q-pt-sm"
                  >
                    <div class="col-xs-11 q-px-xs">
                      <q-input
                        outlined dense label="Configuration" type="Text"
                        v-model="addNewTrackModel.configurations[i]"
                      />
                    </div>
                    <div class="col-xs-1 q-pl-xs">
                      <q-btn
                        round size="sm" style="margin-top: 4px;"
                        icon="delete" color="red"
                        @click="deleteConfig(i)"
                      />
                    </div>
                  </div>
                </transition>
              </div>
              <div class="col-xs-12 q-pt-sm">
                <q-btn
                  id="addConfig"
                  color="primary" icon="add" class="full-width"
                  @click="addConfig" label="Add Configuration"
                  :disabled="addConfigButtonDisabled"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- WEATHER -->
          <q-tab-panel name="weather">
            <div class="row">
              <div class="col-xs-12">
                <transition
                  v-for="(value, i) in addNewTrackModel.weatherOptions" :key="i"
                  appear
                  enter-active-class="animated zoomIn slow-transition"
                  leave-active-class="animated zoomOut slow-transition"
                >
                  <div
                    class="row q-pt-sm"
                  >
                    <div class="col-xs-11 q-px-xs">
                      <q-input
                        outlined dense label="Weather" type="Text"
                        v-model="addNewTrackModel.weatherOptions[i]"
                      />
                    </div>
                    <div class="col-xs-1 q-pl-xs">
                      <q-btn
                        round size="sm" style="margin-top: 4px;"
                        icon="delete" color="red"
                        @click="deleteWeather(i)"
                      />
                    </div>
                  </div>
                </transition>
              </div>
              <div class="col-xs-12 q-pt-sm">
                <q-btn
                  id="addWeatherButton"
                  color="primary" icon="add" class="full-width"
                  @click="addWeather" label="Add Weather"
                  :disabled="addWeatherButtonDisabled"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
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
          :disabled="!addTrackValidation"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'addTrackDialog',
  props: {
    editing: Boolean,
    editingTrack: Object,
    visibility: Boolean,
  },
  data() {
    return {
      tab: 'main',
      uploadUrl: `${process.env.API}/upload`,
      imageUpload: null,
      addExistingTrackModel: {
        name: null,
        image: null,
        configurations: [],
        weatherOptions: [],
      },
      addNewTrackModel: {
        name: null,
        image: null,
        configurations: [],
        weatherOptions: [],
      },
    };
  },
  mounted() {
    if (this.editing === true) {
      this.addNewTrackModel.name = this.editingTrack.name;
      this.addNewTrackModel.image = this.editingTrack.image;
      this.addNewTrackModel.configurations = this.editingTrack.configurations;
      this.addNewTrackModel.weatherOptions = this.editingTrack.weatherOptions;
      this.$forceUpdate();
    }
  },
  methods: {
    // Provides file name info on upload
    uploaded(info) {
      this.imageUpload = info.xhr.response;
    },

    // Add track configuration
    addConfig() {
      this.addNewTrackModel.configurations.push('');
      setTimeout(() => {
        this.$refs.trackWindow.$el.scrollTo({
          top: 10000,
          left: 0,
          behavior: 'smooth',
        });
      }, 10);
    },

    // Delete track configuration
    deleteConfig(i) {
      this.addNewTrackModel.configurations.splice(i, 1);
    },

    // Add weather option
    addWeather() {
      this.addNewTrackModel.weatherOptions.push('');
      setTimeout(() => {
        this.$refs.trackWindow.$el.scrollTo({
          top: 10000,
          left: 0,
          behavior: 'smooth',
        });
      }, 10);
    },

    // Delete weather option
    deleteWeather(i) {
      this.addNewTrackModel.weatherOptions.splice(i, 1);
    },

    // Chooses between edit and create mode
    async save() {
      if (this.editing === true) {
        await this.editTrack();
      } else {
        await this.addTrack();
      }
    },

    // Creates a new track
    async addTrack() {
      await this.$axios
        .post('/track', {
          model: this.addNewTrackModel,
          upload: this.imageUpload,
        })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Track created successfully!',
          });
          this.close();
          this.$emit('trackAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error creating track!',
          });
        });
    },

    // Updates the track
    async editTrack() {
      await this.$axios
        .patch(`/track/${this.editingTrack._id}`, { model: this.addNewTrackModel, upload: this.imageUpload })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Track updated successfully!',
          });
          this.close();
          this.$emit('trackAdded');
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error updating track!',
          });
        });
    },

    // Closes the dialog
    close() {
      this.$emit('close');
    },
  },
  computed: {
    // Validate form
    addTrackValidation() {
      return this.addNewTrackModel.name != null
      && this.addNewTrackModel.name.length > 0
      && !this.addConfigButtonDisabled && !this.addWeatherButtonDisabled;
    },

    // Disables add car button if no info has been added in to last input
    addConfigButtonDisabled() {
      if (this.addNewTrackModel.configurations.length === 0) {
        return false;
      }
      if (this.addNewTrackModel.configurations[this.addNewTrackModel.configurations.length - 1] === '') {
        return true;
      }
      return false;
    },

    // Disables add car button if no info has been added in to last input
    addWeatherButtonDisabled() {
      if (this.addNewTrackModel.weatherOptions.length === 0) {
        return false;
      }
      if (this.addNewTrackModel.weatherOptions[this.addNewTrackModel.weatherOptions.length - 1] === '') {
        return true;
      }
      return false;
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
      if (this.editing === true && this.editingTrack.image != null) {
        return true;
      }
      return false;
    },

    // Get image URL
    getUrl() {
      return `${process.env.BASE}/${this.editingTrack.image}`;
    },
  },
};
</script>
