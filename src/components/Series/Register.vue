<template>
  <q-dialog
    v-model="visibility"
    persistent
    style="width: 700px; max-width: 90vw;"
  >
    <q-card style="min-width: 400px">

      <!--- HEADER --->
      <q-card-section>
        <div class="text-h6">
          Register
        </div>
        <div class="text-subtitle2">
          Series: {{series.name}}
        </div>
        <div class="text-subtitle2">
          Season: {{season.season}}
        </div>
      </q-card-section>

      <!--- MAIN BUTTONS --->
      <q-card-section>
        <div class="row">
          <div class="col-xs-12 q-my-sm">
            <q-btn
              class="full-width"
              color="primary"
              size="xl"
              label="CREATE TEAM"
              @click="create"
            />
          </div>
          <div class="col-xs-12 q-mt-sm">
            <q-btn
              class="full-width"
              color="primary"
              size="xl"
              label="JOIN TEAM"
              @click="join"
            />
          </div>
        </div>
      </q-card-section>

      <!--- ACTION BUTTONS --->
      <q-card-actions
        align="right"
        class="text-primary"
      >
        <q-btn
          flat
          label="Cancel"
          @click.stop="close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'registerDialog',
  props: {
    series: Object,
    season: Object,
    visibility: Boolean,
  },
  data() {
    return {
      newTeam: false,
      joinTeam: false,
    };
  },
  methods: {
    // Closes the dialog
    close() {
      this.$emit('close');
    },
    create() {
      this.$emit('create');
    },
    join() {
      this.$emit('join');
    },
  },
};
</script>
