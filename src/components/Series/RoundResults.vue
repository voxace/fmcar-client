<template>
  <q-dialog
    v-model="visibility" persistent
  >
    <q-card style="width: 900px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">
          View Round Results
        </div>
        <div class="row">
          <div class="col-xs-8">
            <div class="text-subtitle2">
              Round: {{round.round}}
            </div>
            <div class="text-subtitle2">
              Track: {{round.track.name}}
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-markup-table seperator="cell" flat bordered>
          <thead class="bg-primary text-white text-center">
            <tr>
              <th width="40">Position</th>
              <th>Driver</th>
              <th>Team</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody v-if="loadedResults != null && loadedResults.length > 0">
            <template v-for="(result, i) in loadedResults">
              <tr :key="result._id" class="text-center">
                <td width="40">{{i+1}}</td>
                <td>{{result._id}}</td>
                <td>{{result.team}}</td>
                <td>{{result.totalAmount}}</td>
              </tr>
            </template>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6" class="text-center">
                No results found
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn
          flat label="Close"
          @click.stop="close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'roundResultsDialog',
  props: {
    round: Object,
    visibility: Boolean,
  },
  data() {
    return {
      loadingResults: false,
      loadedResults: [],
      addResultDialog: false,
    };
  },
  mounted() {
    this.loadResults();
  },
  methods: {
    // Loads the results for this session
    async loadResults() {
      this.loadingResults = true;
      await this.$axios
        .get(`/results/round/${this.round._id}`)
        .then((response) => {
          this.loadedResults = response.data;
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error loading results!',
          });
        });
      this.loadingResults = false;
    },

    // Closes the dialog
    close() {
      this.$emit('close');
    },
  },
};
</script>
