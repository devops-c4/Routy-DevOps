import path from "node:path";

export default [
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/userauth/Login.vue"),
    },
    {
        path: "/signup",
        name: "Signup",
        component: () => import("@/views/userauth/Signup.vue"),
    },
    {
        path: "/find-email",
        name: "FindEmail",
        component: () => import("@/views/userauth/FindEmail.vue"),
    },
    {
        path: "/find-password",
        name: "FindPassword",
        component: () => import("@/views/userauth/FindPassword.vue"),
    },{
        path: "/change-password",
        name: "ChangePassword",
        component: () => import("@/views/userauth/ChangePassword.vue")
    },{
        path: '/login/success',
        name: 'loginSuccess',
        component: () => import("@/views/userauth/LoginSuccess.vue")
    }
];
