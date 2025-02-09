import {
  createRouter,
  createWebHistory,
  type Router,
  type RouteRecordName,
} from 'vue-router'
import { useUserStore } from '~/stores/user'
import { signInAnonymously } from '~/plugins/firebase/auth'
import { until } from '@vueuse/core'
import { storeToRefs } from 'pinia'

// route views
import QuestionAnswering from '~/components/QuestionAnswering.vue'
import QuestionBundles from '~/components/QuestionBundles.vue'
import AnswersList from '~/components/AnswersList.vue'
import MatchesList from '~/components/MatchesList.vue'
import LinkUsers from '~/components/LinkUsers.vue'
import ProfileView from '~/views/ProfileView.vue'
import SignUpView from '~/views/SignUpView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'answer',
      component: QuestionAnswering,
      beforeEnter: async (to, from, next) => {
        const user = useUserStore()
        if (!user.isSigned) {
          signInAnonymously()
          await user.untilSigned()
        }
        await user.untilLinkStatusChecked()
        if (!user.isLinked) {
          return next('/link') // Redirect to linking page
        }
        next()
      },
    },
    {
      path: '/link',
      name: 'link',
      component: LinkUsers, // Page where user links their account
    },
    {
      path: '/bundles',
      name: 'bundles',
      component: QuestionBundles,
    },
    {
      path: '/answers',
      name: 'answers',
      component: AnswersList,
    },
    {
      path: '/matches',
      name: 'matches',
      component: MatchesList,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
  ],
})

const noAuthWhitelist: RouteRecordName[] = [
  'signup',
  'login',
  'forgot-password',
]

function useAuthGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    try {
      const user = useUserStore()
      const { auth, isSigned } = storeToRefs(user)
      await until(() => auth.value.syncedAtLeastOnce).toBe(true, {
        timeout: 5000,
        throwOnTimeout: true,
      })
      // wait for signIn status which is assigned asynchronously
      if (await user.untilSigned()) {
        if (['login', 'signup'].includes(to.name as string)) {
          // next({ name: 'answer' })
          next()
        } else {
          next()
        }
      } else {
        throw new Error('not-logged-iUser is not logged in')
      }
    } catch (error) {
      if (noAuthWhitelist.includes(to.name)) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
      }
    }
  })
}

useAuthGuard(router)

export default router
