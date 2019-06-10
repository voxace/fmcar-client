<template>
  <q-page>
    <div class="row q-px-lg">
      <div class="col-xs-12">
        <h3>Points Tables</h3>
      </div>
    </div>
    <div class="row q-px-lg">
      <div
        v-for="table in loadedTables" :key="table._id"
        class="col-xs-6 col-sm-4 col-md-3 col-lg-2 col-xl-1 q-pa-sm"
      >
        <q-card>
          <q-card-section>
            <div class="row">
              <div
                class="col-xs-11"
                v-bind:class="{
                  'text-subtitle1': $q.screen.gt.sm,
                  'text-body2': $q.screen.lt.sm,
                  }"
              >
                {{ table.type }}
              </div>
              <div class="col-xs-1">
                <q-btn
                  v-if="editingAllowed"
                  round flat color="primary" icon="edit"
                  size="xs" @click="editTable(table)"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-markup-table
              style="height: 170px;"
              seperator="cell" flat bordered dense
            >
              <thead>
                <tr>
                  <th class="text-center">#</th>
                  <th class="text-center">Points</th>
                </tr>
              </thead>
              <tbody v-if="table.values != null && table.values.length > 0">
                <tr
                  v-for="(value, j)  in table.values"
                  :key="value"
                >
                  <td class="text-center">{{ j + 1 }}</td>
                  <td class="text-center">{{ value }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- FLOATING BUTTON -->
    <q-page-sticky v-if="editingAllowed" position="bottom-right" :offset="[18, 18]">
      <q-btn
        round
        size="lg"
        icon="add"
        color="positive"
        @click="addTable"
      >
      </q-btn>
    </q-page-sticky>
    <!-- ADD TABLE DIALOG -->
    <add-table-dialog
      v-if="addTableDialog"
      :editing="editing" :editingTable="editingTable"
      :visibility="addTableDialog"
      @close="addTableDialog = false" @tableAdded="tableAdded"
    />
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'PointsTables',
  components: {
    addTableDialog: () => import('../../components/Admin/AddPointsTable.vue'),
  },
  meta: {
    title: 'Points Tables',
    titleTemplate: title => `FMCAR - ${title}`,
    meta: {
      description: { name: 'FMCAR Points Tables', content: 'Points Tables' },
      keywords: { name: 'fmcar forza xbox racing', content: 'FMCAR' },
      equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
    },
  },
  data() {
    return {
      loadedTables: [],
      loadingTables: false,
      addTableDialog: false,
      editing: false,
      editingTables: {
        type: null,
        values: [],
      },
    };
  },
  mounted() {
    this.loadTablesList();
  },
  methods: {
    async loadTablesList() {
      this.loadingTables = true;
      await this.$axios
        .get('/points')
        .then((response) => {
          this.loadedTables = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingTables = false;
    },
    async addTable() {
      this.editing = false;
      this.addTableDialog = true;
    },
    async editTable(table) {
      this.editing = true;
      this.editingTable = table;
      this.addTableDialog = true;
    },
    tableAdded() {
      this.loadTablesList();
    },
    close() {
      this.$emit('close');
    },
  },
  computed: {
    editingAllowed() {
      return this.$store.getters.editingAllowed;
    },
  },
};
</script>
