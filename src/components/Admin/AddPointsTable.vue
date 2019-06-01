<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="width: 700px; max-width: 90vw; min-width: 400px">

      <q-card-section>
        <div class="text-h6">
          {{mode}} Points Table
        </div>
      </q-card-section>

      <q-card-section
        style="max-height: 400px;"
        ref="pointsWindow" class="scroll"
      >
        <div class="row">
          <div class="col-xs-12">
            <q-input
              outlined dense label="Name" type="Text"
              v-model="addNewPointsTableModel.type"
            />
          </div>
          <div class="col-xs-12">
            <transition
              v-for="(value, i) in addNewPointsTableModel.values" :key="i"
              appear
              enter-active-class="animated zoomIn slow-transition"
              leave-active-class="animated zoomOut slow-transition"
            >
              <div
                class="row q-pt-sm"
              >
                <div class="col-xs-1 q-pr-xs">
                  <div class="text-subtitle1 q-ml-md q-mt-xs">{{ i+1 }}</div>
                </div>
                <div class="col-xs-10 q-px-xs">
                  <q-input
                    outlined dense label="Points" type="Text"
                    v-model="addNewPointsTableModel.values[i]"
                  />
                </div>
                <div class="col-xs-1 q-pl-xs">
                  <q-btn
                    round size="sm" style="margin-top: 4px;"
                    icon="delete" color="red"
                    @click="deleteValue(i)"
                  />
                </div>
              </div>
            </transition>
          </div>
          <div class="col-xs-12 q-pt-sm">
            <q-btn
              id="addPointsButton"
              color="primary" icon="add" class="full-width"
              @click="addPointValue" label="Add Values"
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
          :disabled="!addPointsTableValidation"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'addPointsTablesDialog',
  props: {
    editing: Boolean,
    editingTable: Object,
    visibility: Boolean,
  },
  data() {
    return {
      addExistingPointsTableModel: {
        type: null,
        values: [],
      },
      addNewPointsTableModel: {
        type: null,
        values: [0],
      },
    };
  },
  mounted() {
    if (this.editing === true) {
      this.addNewPointsTableModel.type = this.editingTable.type;
      this.addNewPointsTableModel.values = this.editingTable.values;
      this.$forceUpdate();
    }
  },
  methods: {

    // Chooses between edit and create mode
    async save() {
      if (this.editing === true) {
        await this.editTable();
      } else {
        await this.addTable();
      }
    },

    // Add points values to the table
    addPointValue() {
      this.addNewPointsTableModel.values.push(0);
      setTimeout(() => {
        this.$refs.pointsWindow.$el.scrollTo({
          top: 10000,
          left: 0,
          behavior: 'smooth',
        });
      }, 10);
    },

    // Delete value from the table
    deleteValue(i) {
      this.addNewPointsTableModel.values.splice(i, 1);
    },

    // Creates a new game
    async addTable() {
      await this.$axios
        .post('/points', { model: this.addNewPointsTableModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Points table created successfully!',
          });
          this.$emit('tableAdded');
          this.close();
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error creating points table!',
          });
        });
    },

    // Updates the game
    async editTable() {
      await this.$axios
        .patch(`/points/${this.editingTable._id}`, { model: this.addNewPointsTableModel })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Points table updated successfully!',
          });
          this.close();
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error updating points table!',
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
    addPointsTableValidation() {
      return this.addNewPointsTableModel.type != null
      && this.addNewPointsTableModel.type.length > 0
      && this.addNewPointsTableModel.values.length > 0;
    },

    // Choose between 'Add' or 'Editing' mode
    mode() {
      if (this.editing === true) {
        return 'Edit';
      }
      return 'Add';
    },
  },
};
</script>
