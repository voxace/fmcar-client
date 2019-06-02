
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
      { path: '/register', component: () => import('pages/Login.vue') },
      { path: '/logout', component: () => import('pages/Logout.vue') },
      { path: '/admin/games', component: () => import('pages/admin/Games.vue') },
      { path: '/admin/tracks', component: () => import('pages/admin/Tracks.vue') },
      { path: '/admin/points', component: () => import('pages/admin/Points.vue') },
      { path: '/verify/:token', component: () => import('pages/admin/Verify.vue') },
      { path: '*', component: () => import('pages/Error404.vue') },
    ],
  },
];

export default routes;
