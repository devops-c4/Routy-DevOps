export default [
    {
        path: '/about',
        name: 'about',
        component: () => import('@/views/footer/AboutView.vue'),
    },
    {
        path: '/guide',
        name: 'guide',
        component: () => import('@/views/footer/GuideView.vue'),
    },
    {
        path: '/terms',
        name: 'terms',
        component: () => import('@/views/footer/TermsView.vue'),
    },
    {
        path: '/privacy',
        name: 'privacy',
        component: () => import('@/views/footer/PrivacyView.vue'),
    },
    {
        path: '/contact',
        name: 'contact',
        component: () => import('@/views/footer/ContactView.vue'),
    },
]
