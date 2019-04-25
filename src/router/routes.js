
const routes = [
  {
    path: '/',
    component: () => import('layouts/Main.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/series', component: () => import('pages/Series.vue') },
      { path: '/results', component: () => import('pages/Results.vue') },
      { path: '/calendar', component: () => import('pages/Calendar.vue') },
      { path: '/discord', beforeEnter() { window.location.href = 'https://discord.gg/dWSQBrQ'; } },
      { path: '/facebook', beforeEnter() { window.location.href = 'https://www.facebook.com/ForzaMotorsportCommunityAustralia'; } },
      { path: '/login', component: () => import('pages/Login.vue') },
      { path: '*', component: () => import('pages/Error404.vue') },
    ],
  },
];

export default routes;
