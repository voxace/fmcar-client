<template>
  <q-dialog
    v-model="visibility" persistent
    style="width: 700px; max-width: 90vw;"
  >
    <q-card style="min-width: 400px">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Track
        </div>
      </q-card-section>

      <q-card-section>
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
      uploadUrl: `${process.env.API}/upload`,
      imageUpload: null,
      addExistingTrackModel: {
        name: null,
        image: null,
        configurations: [''],
        weatherOptions: [''],
      },
      addNewTrackModel: {
        name: null,
        image: null,
        configurations: [''],
        weatherOptions: [''],
      },
    };
  },
  mounted() {
    if (this.editing === true) {
      this.addNewTrackModel.name = this.editingTrack.name;
      this.addNewTrackModel.image = this.editingTrack.image;
      this.$forceUpdate();
    }
  },
  methods: {

    // Provides file name info on upload
    uploaded(info) {
      this.imageUpload = info.xhr.response;
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
      && this.addNewTrackModel.name.length > 0;
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
