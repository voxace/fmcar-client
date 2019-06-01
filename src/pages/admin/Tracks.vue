<template>
  <q-page>
    <div class="row q-px-lg">
      <div class="col-xs-12">
        <h3>Tracks</h3>
      </div>
      <template v-for="track in loadedTracks">
        <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2 q-pa-sm" :key="track._id">
          <q-card>
            <q-img
              v-if="track.image"
              :src="getUrl(track.image)"
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
                {{ track.name }}
              </div>
            </q-card-section>
            <q-card-actions align="around">
              <q-btn flat text-color="blue" @click="editTrack(track)">EDIT</q-btn>
              <q-btn flat text-color="red" @click="deleteTrack(track._id)">DELETE</q-btn>
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
        @click="addTrack"
      >
      </q-btn>
    </q-page-sticky>
    <!-- ADD TEAM DIALOG -->
    <add-track-dialog
      v-if="addTrackDialog"
      :editing="editing" :editingTrack="editingTrack"
      :visibility="addTrackDialog"
      @close="addTrackDialog = false" @trackAdded="trackAdded"
    />
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'Tracks',
  meta: {
    title: 'Tracks',
    titleTemplate: title => `FMCAR - ${title}`,
    meta: {
      description: { name: 'FMCAR Tracks', content: 'Tracks' },
      keywords: { name: 'fmcar forza xbox racing', content: 'FMCAR' },
      equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
    },
  },
  components: {
    addTrackDialog: () => import('components/Admin/AddTrack.vue'),
  },
  data() {
    return {
      loadedTracks: [],
      loadingTracks: false,
      addTrackDialog: false,
      editing: false,
      editingTrack: {
        name: null,
        image: null,
      },
    };
  },
  mounted() {
    this.loadTracksList();
  },
  methods: {
    async loadTracksList() {
      this.loadingTracks = true;
      await this.$axios
        .get('/track')
        .then((response) => {
          this.loadedTracks = response.data;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
      this.loadingTracks = false;
    },
    async addTrack() {
      this.editing = false;
      this.addTrackDialog = true;
    },
    async editTrack(track) {
      this.editing = true;
      this.editingTrack = track;
      this.addTrackDialog = true;
    },
    async deleteTrack(id) {
      await this.$axios
        .delete(`/track/${id}`)
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Track deleted successfully!',
          });
          this.loadTracksList();
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error deleting track!',
          });
        });
    },
    trackAdded() {
      this.loadTracksList();
    },
    getUrl(image) {
      return `${process.env.BASE}/${image}`;
    },
    close() {
      this.$emit('close');
    },
  },
  computed: {
    editingAllowed() {
      return this.$store.state.editingAllowed;
    },
  },
};
</script>
