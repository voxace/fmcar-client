<template>
  <div
    class="col-xs-12 col-md-6"
    v-bind:class="{ 'q-pr-sm': $q.screen.gt.sm }"
  >
    <q-card
      flat
      bordered
    >
      <q-tabs
        v-model="tab2"
        class="bg-primary text-white q-mb-md"
        active-color="white"
        indicator-color="blue-10"
        align="justify"
      >
        <q-tab
          name="info"
          label="General Information"
        />
        <q-tab
          name="regs"
          label="Regulations"
        />
      </q-tabs>
      <q-tab-panels
        v-model="tab2"
        animated
        class="scroll height-1000"
      >
        <q-tab-panel name="info">
          <div class="row">
            <!-- BANNER -->
            <div class="col-xs-12">
              <q-img
                v-if="selectedSeries.banner"
                :src="getUrl(selectedSeries.banner)"
                :ratio="6"
                contain
              />
            </div>
          </div>
          <div
            class="row"
            v-if="$store.state.user"
          >
            <!-- IF NOT REGISTERED -->
            <div
              class="col-xs-12"
              v-if="getUsersTeam === 'no-team'"
            >
              <div class="text-center q-my-sm">
                {{ $store.state.user.name }},
                you are not yet part of a team for this season:
              </div>
              <q-btn
                color="primary"
                icon="how_to_reg"
                class="full-width q-mb-lg"
                label="REGISTER NOW"
                @click="register"
              />
            </div>
            <!-- IF REGISTERED -->
            <div
              class="col-xs-12"
              v-else
            >
              <div class="text-center q-my-sm">
                Welcome, {{ $store.state.user.name }}.
                Team: {{ getUsersTeam }}
              </div>
            </div>
          </div>
          <div
            class="row"
            v-else
          >
            <div class="col-xs-12">
              <div class="text-center q-my-sm">
                You are currently not logged in.
                Login to register for an event or check your results.
              </div>
            </div>
          </div>
          <div class="row">
            <!-- DESCRIPTION -->
            <div class="col-xs-12 q-py-sm q-px-sm">
              <span v-html="selectedSeries.description"></span>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="regs">
          <div class="row">
            <div class="col-xs-12 q-px-sm">
              <span v-html="selectedSeries.regs"></span>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'infoRegs',
  props: {
    selectedSeries: Object,
    getUsersTeam: String,
  },
  data() {
    return {
      tab2: 'info',
    };
  },
  methods: {
    getUrl(image) {
      return `${process.env.BASE}/${image}`;
    },
    register() {
      this.$emit('register');
    },
  },
};
</script>
