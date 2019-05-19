<template>
  <q-dialog
    v-model="visibility" persistent
    style="width: 700px; max-width: 90vw;"
  >
    <q-card style="min-width: 400px">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Game
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row">
          <div class="col-xs-12">
            <q-input
              outlined v-model="addNewGameModel.name"
              label="Name" :dense="$q.screen.lt.sm"
              :rules="[ val => val && val.length > 0 || 'Please enter a name']"
            />
          </div>

          <!-- TODO
            Show image if in editing mode
            have a cross show up on hover
            once the image is deleted, the uploader shows
          -->

          <div class="col-xs-12">
            <q-uploader
              label="Game Image / Logo"
              auto-upload flat bordered
              accept=".jpg, image/*"
              field-name="upload"
              url="http://localhost:3001/api/upload"
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
      addExistingGameModel: {
        name: null,
        logo: null,
      },
      addNewGameModel: {
        name: null,
        logo: null,
      },
    };
  },
  mounted() {
    if (this.editing === true) {
      this.addNewGameModel.name = this.editingGame.name;
      this.addNewGameModel.logo = this.editingGame.logo;
      this.$forceUpdate();
    }
  },
  methods: {
    uploaded(info) {
      console.log(info.xhr.response);
      this.addNewGameModel.logo = info.xhr.response;
    },
    async save() {
      if (this.editing === true) {
        await this.editGame();
      } else {
        await this.addGame();
      }
    },
    async addGame() {
      await this.$axios
        .post('/game', {
          name: this.addNewGameModel.name,
          logo: this.addNewGameModel.logo,
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
    async editTeam() {
      await this.$axios
        .patch(`/game/${this.editingGame._id}`, {
          name: this.addNewGameModel.name,
          logo: this.addNewGameModel.logo,
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
    close() {
      this.$emit('close');
    },
  },
  computed: {
    addGameValidation() {
      return this.addNewGameModel.name != null
      && this.addNewGameModel.name.length > 0;
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
