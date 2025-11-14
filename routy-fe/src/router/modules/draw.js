import path from "node:path";

export default [
  {
    path: '/draw',
    name: 'Draw',
    component: () => import('@/views/draw/Draw.vue'),
    redirect: '/draw/first-draw', 
    children: [
      {
        path: 'first',
        name: 'Firstdraw',
        component: () => import('@/views/draw/FirstDraw.vue'),
      },
      {
        path: 'second',
        name: 'SecondDraw',
        component: () => import('@/views/draw/SecondDraw.vue'),
      },
      {
        path: 'third',
        name: 'ThirdDraw',
        component: () => import('@/views/draw/ThirdDraw.vue'),
      },
      {
        path: 'final',
        name: 'FinalDraw',
        component: () => import('@/views/draw/FinalDraw.vue'),
      },
    ],
  },
];
