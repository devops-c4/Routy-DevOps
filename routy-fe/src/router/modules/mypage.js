import MyPage from '@/views/mypage/MyPage.vue';
import TravelDetailView from '@/views/mypage/TravelDetailView.vue'
import TravelEditView from '@/views/mypage/TravelEditView.vue'

export default [
  {
    path: '/mypage',
    name: 'mypage',
    component: MyPage,
  },
  {
    path: '/mypage/travel/:id',      
    name: 'travelDetail',
    component: TravelDetailView,
    props: true,                   
  },
    {
    path: '/mypage/travel/:id/edit', 
    name: 'travelEdit',
    component: TravelEditView,
    props: true,
  },
  {
  path: '/mypage/travel/:id',
  name: 'TravelDetail',
  component: () => import('@/views/mypage/TravelDetailView.vue'),
},

{
  path: '/mypage/modify',
  name: 'ModifyUser',
  component: () => import('@/views/userauth/ModifyUser.vue'),
}
];