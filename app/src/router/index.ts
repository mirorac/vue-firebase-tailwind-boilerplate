import { createRouter, createWebHistory } from 'vue-router'
import QuestionAnswering from '~/components/QuestionAnswering.vue'
import QuestionBundles from '~/components/QuestionBundles.vue'
import AnswersList from '~/components/AnswersList.vue'
import MatchesList from '~/components/MatchesList.vue'
import { useUserStore } from '~/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'answer',
      component: QuestionAnswering,
      beforeEnter: async (to, from, next) => {
        const user = useUserStore()
        if (!user.isSigned()) {
          const userId = to.query.user as string | undefined
          user.signIn({ id: userId || 'A' })
          await user.untilSigned()
        }
        next()
      },
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
