<template>
  <q-page>
    <div class="row q-px-lg">
      <div class="col-xs-12">
        <h3>Games</h3>
      </div>
      <template v-for="game in loadedGames">
        <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2 q-pa-sm" :key="game._id">
          <q-card>
            <q-img
              v-if="game.logo"
              :src="getUrl(game.logo)"
              :ratio="16/9"
            />
            <q-img
              v-else
              src="statics/placeholder.png"
              :ratio="16/9"
            />
            <q-card-section>
              <div
                class="text-center"
                v-bind:class="{
                  'text-subtitle1': $q.screen.gt.sm,
                  'text-body2': $q.screen.lt.sm,
                  }"
              >
                {{ game.name }}
              </div>
            </q-card-section>
            <q-card-actions align="around" v-if="editingAllowed">
              <q-btn flat text-color="blue" @click="editGame(game)">EDIT</q-btn>
              <q-btn flat text-color="red" @click="deleteGame(game._id)">DELETE</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </div>
    <!-- FLOATING BUTTON -->
    <q-page-sticky v-if="editingAllowed" position="bottom-right" :offset="[18, 18]">
      <q-btn
        round
        size="lg"
        icon="add"
        color="positive"
        @click="addGame"
      >
      </q-btn>
    </q-page-sticky>
    <!-- ADD TEAM DIALOG -->
    <add-game-dialog
      v-if="addGameDialog"
      :editing="editing" :editingGame="editingGame"
      :visibility="addGameDialog"
      @close="addGameDialog = false" @gameAdded="gameAdded"
    />
  </q-page>
</template>

<script>
export default {
  name: 'Games',
  meta: {
    title: 'Games',
    titleTemplate: title => `FMCAR - ${title}`,
    meta: {
      description: { name: 'FMCAR Games', content: 'Games' },
      keywords: { name: 'fmcar forza xbox racing', content: 'FMCAR' },
      equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
    },
  },
  components: {
    addGameDialog: () => import('components/Admin/AddGame.vue'),
  },
  data() {
    return {
      loadedGames: [],
      loadingGames: false,
      addGameDialog: false,
      editing: false,
      editingGame: {
        name: null,
        tracks: null,
        logo: null,
      },
    };
  },
  mounted() {
    this.loadGamesList();
  },
  methods: {
    async loadGamesList() {
      this.loadingGames = true;
      await this.$axios
        .get('/game')
        .then((response) => {
          this.loadedGames = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingGames = false;
    },
    async addGame() {
      this.editing = false;
      this.addGameDialog = true;
    },
    async editGame(game) {
      this.editing = true;
      this.editingGame = game;
      this.addGameDialog = true;
    },
    async deleteGame(id) {
      await this.$axios
        .delete(`/game/${id}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Game deleted successfully!',
          });
          this.loadGamesList();
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error deleting game!',
          });
        });
    },
    gameAdded() {
      this.loadGamesList();
    },
    getUrl(logo) {
      return `${process.env.BASE}/${logo}`;
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
