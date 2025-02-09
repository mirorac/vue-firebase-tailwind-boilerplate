import { createRouter, createWebHistory } from 'vue-router'
import QuestionAnswering from '~/components/QuestionAnswering.vue'
import QuestionBundles from '~/components/QuestionBundles.vue'
import AnswersList from '~/components/AnswersList.vue'
import MatchesList from '~/components/MatchesList.vue'
import LinkUsers from '~/components/LinkUsers.vue'
import { useUserStore } from '~/stores/user'
import { signInAnonymously } from '~/plugins/firebase/auth'

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
  ],
})

export default router
