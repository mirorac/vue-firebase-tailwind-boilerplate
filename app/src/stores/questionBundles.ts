// src/stores/questionBundles.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { sortBy } from 'lodash'
import type {
  AcquiredQuestion,
  AcquiredQuestionBundle,
  QuestionBundle,
} from '@/types/questions'
import { useSignedUserStore, useUserStore } from '@/stores/user'
import {
  addDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { acquiredBundlesCollection } from '~/plugins/firebase/db'
import type { LinkedUsers } from '~/types/users'

const staticBundles: QuestionBundle[] = [
  {
    id: '2',
    title: 'Sex & Intimacy Exploration',
    description:
      'Yes/No questions to help couples explore various aspects of their sexual and intimate relationship.',
    themes: [
      'sex',
      'intimacy',
      'communication',
      'fantasies',
      'kinky-sex',
      'roleplay',
      'threesomes',
    ],
    questions: {
      '1': {
        id: '1',
        themes: ['fantasies'],
        type: 'matching',
        text: 'Do you have a sexual fantasy you would like to explore with your partner?',
      },
      '2': {
        id: '2',
        themes: ['roleplay'],
        type: 'matching',
        text: 'Do you enjoy incorporating elements of roleplay into your intimate encounters?',
      },
      '3': {
        id: '3',
        themes: ['bdsm', 'power-exchange'],
        type: 'matching',
        text: 'Do you enjoy the idea of dom/sub power dynamics during sex?',
      },
      '4': {
        id: '4',
        themes: ['threesomes'],
        type: 'matching',
        text: 'Would you be open to exploring a threesome or group encounter?',
      },
      '5': {
        id: '5',
        themes: ['communication'],
        type: 'matching',
        text: 'Do you feel comfortable discussing your sexual needs and desires with your partner?',
      },
      '6': {
        id: '6',
        themes: ['experimentation'],
        type: 'matching',
        text: 'Are you open to trying new sexual experiences even if you’re unsure you’d like them?',
      },
      '7': {
        id: '7',
        themes: ['oral-sex'],
        type: 'matching',
        text: 'Do you enjoy giving oral sex as much as receiving it?',
      },
      '8': {
        id: '8',
        themes: ['public-sex'],
        type: 'matching',
        text: 'Would the idea of having sex in a semi-public or risky place excite you?',
      },
      '9': {
        id: '9',
        themes: ['toys'],
        type: 'matching',
        text: 'Are you comfortable using sex toys with your partner?',
      },
      '10': {
        id: '10',
        themes: ['fantasies'],
        type: 'matching',
        text: 'Would you be open to sharing your sexual fantasies with your partner?',
      },
      '11': {
        id: '11',
        themes: ['watching'],
        type: 'matching',
        text: 'Would watching erotic content together turn you on?',
      },
      '12': {
        id: '12',
        themes: ['dominance'],
        type: 'matching',
        text: 'Would you be comfortable with your partner taking full control in bed?',
      },
      '13': {
        id: '13',
        themes: ['submission'],
        type: 'matching',
        text: 'Would you enjoy being completely submissive to your partner in a sexual setting?',
      },
      '14': {
        id: '14',
        themes: ['lingerie'],
        type: 'matching',
        text: 'Do you find it arousing when your partner wears sexy lingerie or outfits?',
      },
      '15': {
        id: '15',
        themes: ['dirty-talk'],
        type: 'matching',
        text: 'Do you enjoy engaging in dirty talk during sex?',
      },
      '16': {
        id: '16',
        themes: ['sexting'],
        type: 'matching',
        text: 'Would you be open to sexting or sending intimate messages to spice things up?',
      },
      '17': {
        id: '17',
        themes: ['voyeurism'],
        type: 'matching',
        text: 'Would you be turned on by watching other people engage in sexual activities?',
      },
      '18': {
        id: '18',
        themes: ['exhibitionism'],
        type: 'matching',
        text: 'Would the idea of someone secretly watching you have sex excite you?',
      },
      '19': {
        id: '19',
        themes: ['fantasies'],
        type: 'matching',
        text: 'Do you think it’s healthy for couples to openly discuss their fantasies without judgment?',
      },
      '20': {
        id: '20',
        themes: ['sensory-play'],
        type: 'matching',
        text: 'Would you be open to experimenting with sensory deprivation, such as blindfolds or restraints?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2_2',
    title: 'Kinky Sex Questions',
    description:
      'Questions exploring the boundaries and desires around kinky sex.',
    themes: ['kinky sex'],
    questions: {
      '1': {
        id: '1',
        themes: ['kinky sex'],
        type: 'matching',
        text: 'Are you interested in experimenting with BDSM?',
      },
      '2': {
        id: '2',
        themes: ['kinky sex'],
        type: 'open-ended',
        text: 'What types of kinky activities have you considered or tried?',
      },
      '3': {
        id: '3',
        themes: ['kinky sex'],
        type: 'matching',
        text: 'Do you enjoy power dynamics in intimate scenarios?',
      },
      '4': {
        id: '4',
        themes: ['kinky sex'],
        type: 'open-ended',
        text: 'How do you define kinky sex?',
      },
      '5': {
        id: '5',
        themes: ['kinky sex'],
        type: 'matching',
        text: 'Would you be open to trying role-playing with your partner?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Emotional Connection Questions',
    description: 'Questions exploring emotional intimacy and connection.',
    themes: ['emotion'],
    questions: {
      '1': {
        id: '1',
        themes: ['emotion'],
        type: 'open-ended',
        text: 'What makes you feel emotionally supported in a relationship?',
      },
      '2': {
        id: '2',
        themes: ['emotion'],
        type: 'matching',
        text: 'Do you believe it is important to discuss emotions openly in a relationship?',
      },
      '3': {
        id: '3',
        themes: ['emotion'],
        type: 'open-ended',
        text: 'How do you express affection in a relationship?',
      },
      '4': {
        id: '4',
        themes: ['emotion'],
        type: 'matching',
        text: 'Do you feel emotionally vulnerable with your partner?',
      },
      '5': {
        id: '5',
        themes: ['emotion'],
        type: 'open-ended',
        text: 'How do you handle emotional disagreements with your partner?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '3_3',
    title: 'BDSM Deep Dive',
    description:
      'Yes/No questions for couples interested in exploring BDSM practices—focusing on negotiation, consent, safety, and aftercare.',
    themes: [
      'bdsm',
      'power-exchange',
      'consent',
      'aftercare',
      'kinky-sex',
      'negotiation',
    ],
    questions: {
      '1': {
        id: '1',
        themes: ['bdsm'],
        type: 'matching',
        text: 'Are you intrigued by BDSM elements such as sensation play or power dynamics?',
      },
      '2': {
        id: '2',
        themes: ['consent'],
        type: 'matching',
        text: 'Are you comfortable discussing and setting clear boundaries before engaging in BDSM activities?',
      },
      '3': {
        id: '3',
        themes: ['powerplay'],
        type: 'matching',
        text: 'Would you be interested in exploring dominant/submissive roles in your relationship?',
      },
      '4': {
        id: '4',
        themes: ['safety'],
        type: 'matching',
        text: 'Do you think establishing a safe word or signal is essential for ensuring safety during BDSM play?',
      },
      '5': {
        id: '5',
        themes: ['aftercare'],
        type: 'matching',
        text: 'Do you believe that thorough aftercare is crucial following a BDSM session?',
      },
      '6': {
        id: '6',
        themes: ['restraints'],
        type: 'matching',
        text: 'Would you be comfortable being tied up or tying up your partner?',
      },
      '7': {
        id: '7',
        themes: ['impact-play'],
        type: 'matching',
        text: 'Would you enjoy exploring spanking, flogging, or paddling in a controlled setting?',
      },
      '8': {
        id: '8',
        themes: ['roleplay'],
        type: 'matching',
        text: 'Would you enjoy engaging in authority-based roleplay, such as teacher/student or master/slave?',
      },
      '9': {
        id: '9',
        themes: ['choking'],
        type: 'matching',
        text: 'Do you think breath play (light choking) can be erotic when done safely?',
      },
      '10': {
        id: '10',
        themes: ['pain-play'],
        type: 'matching',
        text: 'Would you find controlled pain (such as biting or pinching) pleasurable?',
      },
      '11': {
        id: '11',
        themes: ['control'],
        type: 'matching',
        text: 'Would you enjoy giving up total control to your partner for a session?',
      },
      '12': {
        id: '12',
        themes: ['denial'],
        type: 'matching',
        text: 'Would you enjoy orgasm control or denial as part of BDSM play?',
      },
      '13': {
        id: '13',
        themes: ['degradation'],
        type: 'matching',
        text: 'Would you be comfortable engaging in mild degradation play, such as name-calling?',
      },
      '14': {
        id: '14',
        themes: ['edging'],
        type: 'matching',
        text: 'Would you enjoy being brought to the edge of orgasm multiple times before release?',
      },
      '15': {
        id: '15',
        themes: ['cuckolding'],
        type: 'matching',
        text: 'Are you curious about cuckolding or hotwife/husbands scenarios?',
      },
      '16': {
        id: '16',
        themes: ['fetish'],
        type: 'matching',
        text: 'Would you be interested in discovering if you have any kinks or fetishes?',
      },
      '17': {
        id: '17',
        themes: ['public-play'],
        type: 'matching',
        text: 'Would you be excited by the idea of discreet BDSM play in a public setting?',
      },
      '18': {
        id: '18',
        themes: ['service'],
        type: 'matching',
        text: 'Would you enjoy acts of service as a form of submission or dominance?',
      },
      '19': {
        id: '19',
        themes: ['hypnosis'],
        type: 'matching',
        text: 'Would you be open to exploring erotic hypnosis or mind control play?',
      },
      '20': {
        id: '20',
        themes: ['marking'],
        type: 'matching',
        text: 'Do you find the idea of leaving marks (hickeys, scratches, bruises) exciting?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Communication & Consent',
    description:
      'Yes/No questions designed to help couples strengthen open communication, discuss boundaries, and establish mutual consent in their intimate lives.',
    themes: ['communication', 'consent', 'boundaries', 'honesty'],
    questions: {
      '1': {
        id: '1',
        themes: ['communication'],
        type: 'matching',
        text: 'Do you feel comfortable discussing your sexual boundaries with your partner?',
      },
      '2': {
        id: '2',
        themes: ['consent'],
        type: 'matching',
        text: 'Do you believe that regular check-ins about consent enhance your sexual experience?',
      },
      '3': {
        id: '3',
        themes: ['communication'],
        type: 'matching',
        text: 'Would you be open to scheduling regular “sex talks” to discuss desires and limits?',
      },
      '4': {
        id: '4',
        themes: ['fantasy'],
        type: 'matching',
        text: 'Do you believe that openly discussing your fantasies leads to a healthier sex life?',
      },
      '5': {
        id: '5',
        themes: ['trust'],
        type: 'matching',
        text: 'Do you feel that clear, honest communication builds trust in your relationship?',
      },
      '6': {
        id: '6',
        themes: ['consent'],
        type: 'matching',
        text: 'Are you comfortable using safe words during intimate encounters?',
      },
      '7': {
        id: '7',
        themes: ['communication'],
        type: 'matching',
        text: 'Do you think discussing past sexual experiences can positively influence your current relationship?',
      },
      '8': {
        id: '8',
        themes: ['boundaries'],
        type: 'matching',
        text: 'Would you agree that your partner respects your limits when you voice them?',
      },
      '9': {
        id: '9',
        themes: ['non-verbal'],
        type: 'matching',
        text: 'Do you believe non-verbal cues are as important as verbal communication during intimacy?',
      },
      '10': {
        id: '10',
        themes: ['consent'],
        type: 'matching',
        text: 'Do you think that discussing consent and boundaries regularly makes sex more enjoyable?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Emotional Connection & Vulnerability',
    description:
      'Yes/No questions that encourage couples to explore emotional closeness and vulnerability as keys to a more fulfilling intimate relationship.',
    themes: ['emotional-intimacy', 'vulnerability', 'trust', 'connection'],
    questions: {
      '1': {
        id: '1',
        themes: ['emotional-intimacy'],
        type: 'matching',
        text: 'Do you feel emotionally connected to your partner during intimacy?',
      },
      '2': {
        id: '2',
        themes: ['vulnerability'],
        type: 'matching',
        text: 'Are you comfortable being vulnerable about your feelings with your partner?',
      },
      '3': {
        id: '3',
        themes: ['trust'],
        type: 'matching',
        text: 'Do you believe that sharing personal insecurities deepens your intimacy?',
      },
      '4': {
        id: '4',
        themes: ['connection'],
        type: 'matching',
        text: 'Would you say that emotional closeness is essential for your sexual satisfaction?',
      },
      '5': {
        id: '5',
        themes: ['emotional-intimacy'],
        type: 'matching',
        text: 'Do you feel that physical intimacy helps strengthen your emotional bond?',
      },
      '6': {
        id: '6',
        themes: ['communication'],
        type: 'matching',
        text: 'Are you open to discussing your fears and desires with your partner?',
      },
      '7': {
        id: '7',
        themes: ['trust'],
        type: 'matching',
        text: 'Do you believe that a strong emotional connection makes sex more fulfilling?',
      },
      '8': {
        id: '8',
        themes: ['vulnerability'],
        type: 'matching',
        text: 'Would you agree that being emotionally available enhances your sexual experiences?',
      },
      '9': {
        id: '9',
        themes: ['support'],
        type: 'matching',
        text: 'Do you feel supported by your partner when you express your vulnerabilities?',
      },
      '10': {
        id: '10',
        themes: ['connection'],
        type: 'matching',
        text: 'Do you believe that shared laughter and fun contribute to a deeper emotional bond?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Foreplay & Sensory Exploration',
    description:
      'Yes/No questions to help couples enhance their arousal and connection by exploring foreplay and engaging all the senses.',
    themes: ['foreplay', 'sensory', 'anticipation', 'touch'],
    questions: {
      '1': {
        id: '1',
        themes: ['foreplay'],
        type: 'matching',
        text: 'Do you believe that extended foreplay enhances your sexual experience?',
      },
      '2': {
        id: '2',
        themes: ['touch'],
        type: 'matching',
        text: 'Do you enjoy incorporating massages into your intimate moments?',
      },
      '3': {
        id: '3',
        themes: ['experimentation'],
        type: 'matching',
        text: 'Would you be open to experimenting with different types of touch during foreplay?',
      },
      '4': {
        id: '4',
        themes: ['sensory'],
        type: 'matching',
        text: 'Do you think that setting the mood with music, lighting, or scents is important for intimacy?',
      },
      '5': {
        id: '5',
        themes: ['anticipation'],
        type: 'matching',
        text: 'Do you enjoy teasing and building anticipation before sex?',
      },
      '6': {
        id: '6',
        themes: ['sensory'],
        type: 'matching',
        text: 'Do you feel that exploring different textures or temperatures adds excitement to your foreplay?',
      },
      '7': {
        id: '7',
        themes: ['sensory'],
        type: 'matching',
        text: 'Would you agree that engaging all your senses can make intimacy more memorable?',
      },
      '8': {
        id: '8',
        themes: ['foreplay'],
        type: 'matching',
        text: 'Do you enjoy using scented oils or lotions during foreplay?',
      },
      '9': {
        id: '9',
        themes: ['experimentation'],
        type: 'matching',
        text: 'Are you open to trying new sensory experiences during intimate moments?',
      },
      '10': {
        id: '10',
        themes: ['anticipation'],
        type: 'matching',
        text: 'Do you believe that the buildup before sex is as important as the act itself?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Sexual Techniques & Pleasure',
    description:
      'Yes/No questions designed to encourage couples to explore and refine various sexual techniques to enhance mutual pleasure and satisfaction.',
    themes: ['techniques', 'pleasure', 'positions', 'adventure'],
    questions: {
      '1': {
        id: '1',
        themes: ['techniques'],
        type: 'matching',
        text: 'Do you feel satisfied with your current sexual techniques?',
      },
      '2': {
        id: '2',
        themes: ['positions'],
        type: 'matching',
        text: 'Are you open to exploring new sexual positions?',
      },
      '3': {
        id: '3',
        themes: ['rhythm'],
        type: 'matching',
        text: 'Do you enjoy experimenting with different speeds and rhythms during sex?',
      },
      '4': {
        id: '4',
        themes: ['variety'],
        type: 'matching',
        text: 'Do you believe that variety in techniques keeps your sex life exciting?',
      },
      '5': {
        id: '5',
        themes: ['learning'],
        type: 'matching',
        text: 'Would you be willing to learn new techniques to enhance pleasure for both you and your partner?',
      },
      '6': {
        id: '6',
        themes: ['communication'],
        type: 'matching',
        text: 'Do you feel that open communication during sex helps improve your technique and pleasure?',
      },
      '7': {
        id: '7',
        themes: ['pleasure'],
        type: 'matching',
        text: 'Do you enjoy focusing on your partner’s pleasure as much as your own?',
      },
      '8': {
        id: '8',
        themes: ['adventure'],
        type: 'matching',
        text: 'Do you think that being adventurous in the bedroom leads to a more fulfilling sex life?',
      },
      '9': {
        id: '9',
        themes: ['education'],
        type: 'matching',
        text: 'Would you be open to taking a class or workshop on enhancing your sexual skills?',
      },
      '10': {
        id: '10',
        themes: ['revival'],
        type: 'matching',
        text: 'Do you believe that trying new techniques can revive passion in a long-term relationship?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'Fantasy & Roleplay Exploration',
    description:
      'Yes/No questions that invite couples to share and explore their erotic fantasies and roleplay scenarios to add excitement and novelty to their intimacy.',
    themes: ['fantasies', 'roleplay', 'escapism', 'imagination'],
    questions: {
      '1': {
        id: '1',
        themes: ['fantasies'],
        type: 'matching',
        text: 'Do you have erotic fantasies you haven’t shared with your partner?',
      },
      '2': {
        id: '2',
        themes: ['roleplay'],
        type: 'matching',
        text: 'Would you be open to incorporating roleplay scenarios into your sex life?',
      },
      '3': {
        id: '3',
        themes: ['fantasies'],
        type: 'matching',
        text: 'Do you believe that exploring fantasies together can enhance your intimacy?',
      },
      '4': {
        id: '4',
        themes: ['roleplay'],
        type: 'matching',
        text: 'Do you feel that roleplay can add excitement and novelty to your sexual encounters?',
      },
      '5': {
        id: '5',
        themes: ['creativity'],
        type: 'matching',
        text: 'Would you enjoy trying out different characters or scenarios in the bedroom?',
      },
      '6': {
        id: '6',
        themes: ['taboo'],
        type: 'matching',
        text: 'Do you think that fantasizing about taboo scenarios can be arousing?',
      },
      '7': {
        id: '7',
        themes: ['communication'],
        type: 'matching',
        text: 'Are you comfortable discussing your sexual fantasies with your partner?',
      },
      '8': {
        id: '8',
        themes: ['bonding'],
        type: 'matching',
        text: 'Do you believe that a shared fantasy can bring you closer as a couple?',
      },
      '9': {
        id: '9',
        themes: ['creativity'],
        type: 'matching',
        text: 'Would you be interested in creating a fantasy game or story with your partner?',
      },
      '10': {
        id: '10',
        themes: ['self-discovery'],
        type: 'matching',
        text: 'Do you think that acting out fantasies can help you better understand your desires?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '9',
    title: 'Adventurous Play & Kink',
    description:
      'Yes/No questions crafted for couples curious about exploring light kink and unconventional activities to add an adventurous twist to their intimacy.',
    themes: ['kink', 'adventure', 'BDSM-light', 'exploration'],
    questions: {
      '1': {
        id: '1',
        themes: ['kink'],
        type: 'matching',
        text: 'Are you curious about exploring light kink or adventurous play in the bedroom?',
      },
      '2': {
        id: '2',
        themes: ['BDSM-light'],
        type: 'matching',
        text: 'Do you think that introducing mild BDSM elements can enhance your intimacy?',
      },
      '3': {
        id: '3',
        themes: ['power-dynamics'],
        type: 'matching',
        text: 'Would you be interested in experimenting with power dynamics outside of traditional roles?',
      },
      '4': {
        id: '4',
        themes: ['communication'],
        type: 'matching',
        text: 'Do you feel comfortable discussing your kink interests with your partner?',
      },
      '5': {
        id: '5',
        themes: ['adventure'],
        type: 'matching',
        text: 'Do you believe that trying something unconventional can add excitement to your sex life?',
      },
      '6': {
        id: '6',
        themes: ['experimentation'],
        type: 'matching',
        text: 'Would you be open to incorporating elements like light bondage or spanking?',
      },
      '7': {
        id: '7',
        themes: ['growth'],
        type: 'matching',
        text: 'Do you think that being adventurous sexually can help you grow together as a couple?',
      },
      '8': {
        id: '8',
        themes: ['games'],
        type: 'matching',
        text: 'Are you open to trying erotic games or dares during intimacy?',
      },
      '9': {
        id: '9',
        themes: ['boundaries'],
        type: 'matching',
        text: 'Do you believe that exploring kink helps clarify your personal limits?',
      },
      '10': {
        id: '10',
        themes: ['novelty'],
        type: 'matching',
        text: 'Would you be excited to try new, unconventional activities in the bedroom?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '10',
    title: 'Sexual Health & Wellness',
    description:
      'Yes/No questions that prompt couples to discuss and prioritize sexual health, safety, and overall wellness as part of a fulfilling intimate life.',
    themes: ['sexual-health', 'wellness', 'safety', 'education'],
    questions: {
      '1': {
        id: '1',
        themes: ['health'],
        type: 'matching',
        text: 'Do you feel comfortable discussing sexual health topics with your partner?',
      },
      '2': {
        id: '2',
        themes: ['wellness'],
        type: 'matching',
        text: 'Do you believe that regular sexual health check-ups are important for a healthy sex life?',
      },
      '3': {
        id: '3',
        themes: ['safety'],
        type: 'matching',
        text: 'Are you proactive about using protection or other safe sex measures?',
      },
      '4': {
        id: '4',
        themes: ['education'],
        type: 'matching',
        text: 'Do you feel that being informed about sexual health improves your intimacy?',
      },
      '5': {
        id: '5',
        themes: ['trust'],
        type: 'matching',
        text: 'Do you think that mutual understanding of each other’s health contributes to trust?',
      },
      '6': {
        id: '6',
        themes: ['wellness'],
        type: 'matching',
        text: 'Would you be open to discussing birth control and sexual wellness options together?',
      },
      '7': {
        id: '7',
        themes: ['shared-responsibility'],
        type: 'matching',
        text: 'Do you feel that maintaining sexual health is a shared responsibility in your relationship?',
      },
      '8': {
        id: '8',
        themes: ['learning'],
        type: 'matching',
        text: 'Do you think that learning about new sexual practices can improve your overall wellness?',
      },
      '9': {
        id: '9',
        themes: ['communication'],
        type: 'matching',
        text: 'Are you comfortable discussing past sexual experiences in relation to health matters?',
      },
      '10': {
        id: '10',
        themes: ['prevention'],
        type: 'matching',
        text: 'Do you believe that focusing on sexual health can enhance your overall relationship satisfaction?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '11',
    title: 'Self-Exploration & Personal Growth',
    description:
      'Yes/No questions designed to encourage personal sexual discovery and self-pleasure as a foundation for greater shared intimacy.',
    themes: [
      'self-exploration',
      'personal-growth',
      'empowerment',
      'body-image',
    ],
    questions: {
      '1': {
        id: '1',
        themes: ['self-exploration'],
        type: 'matching',
        text: 'Do you feel that self-exploration is important for understanding your sexual needs?',
      },
      '2': {
        id: '2',
        themes: ['empowerment'],
        type: 'matching',
        text: 'Are you comfortable engaging in self-pleasure to discover what you enjoy?',
      },
      '3': {
        id: '3',
        themes: ['body-awareness'],
        type: 'matching',
        text: 'Do you believe that knowing your own body can enhance your experiences with your partner?',
      },
      '4': {
        id: '4',
        themes: ['growth'],
        type: 'matching',
        text: 'Would you be interested in exploring new ways to experience self-pleasure?',
      },
      '5': {
        id: '5',
        themes: ['body-image'],
        type: 'matching',
        text: 'Do you think that a positive body image contributes to a fulfilling sex life?',
      },
      '6': {
        id: '6',
        themes: ['communication'],
        type: 'matching',
        text: 'Are you open to discussing personal sexual growth with your partner?',
      },
      '7': {
        id: '7',
        themes: ['empowerment'],
        type: 'matching',
        text: 'Do you feel empowered when you explore your sexuality on your own?',
      },
      '8': {
        id: '8',
        themes: ['self-awareness'],
        type: 'matching',
        text: 'Would you agree that self-awareness of your desires leads to better intimacy?',
      },
      '9': {
        id: '9',
        themes: ['self-care'],
        type: 'matching',
        text: 'Do you believe that taking time for self-care includes understanding your sexual potential?',
      },
      '10': {
        id: '10',
        themes: ['exploration'],
        type: 'matching',
        text: 'Are you willing to try new forms of self-exploration to better understand your desires?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '12',
    title: 'Digital & Virtual Intimacy',
    description:
      'Yes/No questions that explore how technology and digital communication can enhance intimacy and playfulness between partners.',
    themes: ['digital-intimacy', 'sexting', 'virtual-play', 'technology'],
    questions: {
      '1': {
        id: '1',
        themes: ['sexting'],
        type: 'matching',
        text: 'Do you enjoy sending flirtatious or intimate texts to your partner during the day?',
      },
      '2': {
        id: '2',
        themes: ['virtual-play'],
        type: 'matching',
        text: 'Would you be interested in exploring video dates that focus on intimacy?',
      },
      '3': {
        id: '3',
        themes: ['digital-intimacy'],
        type: 'matching',
        text: 'Do you believe that digital intimacy can enhance your sexual connection?',
      },
      '4': {
        id: '4',
        themes: ['privacy'],
        type: 'matching',
        text: 'Are you comfortable sharing erotic photos or videos with your partner?',
      },
      '5': {
        id: '5',
        themes: ['sexting'],
        type: 'matching',
        text: 'Do you think that sexting helps keep the spark alive between you?',
      },
      '6': {
        id: '6',
        themes: ['technology'],
        type: 'matching',
        text: 'Would you enjoy using apps designed to boost couple’s intimacy?',
      },
      '7': {
        id: '7',
        themes: ['digital-exploration'],
        type: 'matching',
        text: 'Do you feel that digital intimacy provides a safe space to explore fantasies?',
      },
      '8': {
        id: '8',
        themes: ['innovation'],
        type: 'matching',
        text: 'Are you open to trying virtual reality experiences that simulate intimate encounters?',
      },
      '9': {
        id: '9',
        themes: ['playfulness'],
        type: 'matching',
        text: 'Do you believe that technology can add a playful dimension to your relationship?',
      },
      '10': {
        id: '10',
        themes: ['experimentation'],
        type: 'matching',
        text: 'Would you be excited to experiment with new digital tools to enhance intimacy?',
      },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '13',
    title: 'Aftercare & Post-Sex Connection',
    description:
      'Yes/No questions that emphasize the importance of aftercare, reconnection, and emotional support following intimate encounters.',
    themes: ['aftercare', 'connection', 'cuddling', 'emotional-support'],
    questions: {
      '1': {
        id: '1',
        themes: ['aftercare'],
        type: 'matching',
        text: 'Do you believe that post-sex cuddling is important for emotional connection?',
      },
      '2': {
        id: '2',
        themes: ['communication'],
        type: 'matching',
        text: 'Are you open to discussing your feelings after an intimate encounter?',
      },
      '3': {
        id: '3',
        themes: ['rituals'],
        type: 'matching',
        text: 'Do you feel that aftercare rituals deepen your bond with your partner?',
      },
      '4': {
        id: '4',
        themes: ['dedication'],
        type: 'matching',
        text: 'Would you be interested in setting aside dedicated time for aftercare after sex?',
      },
      '5': {
        id: '5',
        themes: ['connection'],
        type: 'matching',
        text: 'Do you think that sharing a quiet moment after sex enhances your relationship?',
      },
      '6': {
        id: '6',
        themes: ['touch'],
        type: 'matching',
        text: 'Do you feel that continued physical touch after intimacy reinforces your emotional bond?',
      },
      '7': {
        id: '7',
        themes: ['feedback'],
        type: 'matching',
        text: 'Are you comfortable discussing what makes you feel cared for after sex?',
      },
      '8': {
        id: '8',
        themes: ['routine'],
        type: 'matching',
        text: 'Do you believe that a structured aftercare routine improves overall satisfaction?',
      },
      '9': {
        id: '9',
        themes: ['connection'],
        type: 'matching',
        text: 'Would you agree that aftercare is as important as the act of intimacy itself?',
      },
      '10': {
        id: '10',
        themes: ['long-term'],
        type: 'matching',
        text: 'Do you think that spending time together after sex helps maintain a long-term connection?',
      },
    },
    createdAt: new Date().toISOString(),
  },
]

const transformToAcquiredBundle = (
  bundle: QuestionBundle,
  link: LinkedUsers
): AcquiredQuestionBundle => {
  const bundleCopy: QuestionBundle<AcquiredQuestion> = JSON.parse(
    JSON.stringify(bundle)
  )
  Object.values(bundleCopy.questions).forEach((question) => {
    question.answers = {}
  })
  return {
    bundleId: bundle.id,
    linkId: link.id,
    users: link.users,
    bundle: bundleCopy,
    createdAt: serverTimestamp(),
  }
}

export const useQuestionBundlesStore = defineStore('questionBundles', () => {
  // init dependencies
  const user = useSignedUserStore()
  console.log('Bundles loaded for user: ', user.id)

  // State
  const bundles = ref<QuestionBundle[]>(staticBundles)
  const acquiredBundles = ref(new Map<string, AcquiredQuestionBundle>())
  const acquiredBundlesArray = computed(() =>
    Array.from(acquiredBundles.value.values())
  )

  // Actions
  const getList = (): QuestionBundle[] => {
    return bundles.value
  }

  const getBundle = (id: string): QuestionBundle | undefined => {
    return bundles.value.find((bundle) => bundle.id === id)
  }

  const isAcquired = (id: string) =>
    acquiredBundlesArray.value.some((acquired) => acquired.bundleId == id)

  const acquire = (bundle: QuestionBundle) => {
    if (!isAcquired(bundle.id)) {
      addDoc(
        acquiredBundlesCollection,
        transformToAcquiredBundle(bundle, user.link)
      )
      console.log('added questions budnle: ', bundle.id)
    }
  }

  const updateAnswer = async (
    acquiredBundleId: string,
    questionId: string,
    answer: string
  ) => {
    const bundleDoc = doc(acquiredBundlesCollection, acquiredBundleId)
    updateDoc(bundleDoc, {
      [`bundle.questions.${questionId}.answers.${user.id}`]: {
        answer,
        createdAt: serverTimestamp(),
      },
    })
  }

  const syncAcquiredBundles = async () => {
    await user.untilLinked()
    const q = query(
      acquiredBundlesCollection,
      where('linkId', '==', user.link.id)
    )
    const stopSync = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        switch (change.type) {
          case 'added':
          case 'modified':
            acquiredBundles.value.set(change.doc.id, change.doc.data())
            break
          case 'removed':
            acquiredBundles.value.delete(change.doc.id)
        }
      })
    })
  }

  const isMatch = (a: string, b: string) =>
    (a == 'yes' && b == 'yes') ||
    (a == 'yes' && b == 'maybe') ||
    (a == 'maybe' && b == 'yes') ||
    (a == 'maybe' && b == 'maybe')

  /**
   * questions with matching answers within acquired bundles.
   * A match is identified when a question contains at least two identical answers.
   *
   * @returns An array of questions where at least two answers match.
   */
  const matches = computed(() => {
    const matchedQuestions = Array.from(acquiredBundles.value.values()).flatMap(
      (acquiredBundle) =>
        Object.values(acquiredBundle.bundle.questions).filter((question) =>
          Object.values(question.answers).some((answer, index, answers) =>
            answers
              .slice(index + 1)
              .some((otherAnswer) => isMatch(answer.answer, otherAnswer.answer))
          )
        )
    )
    // sort matches so the most recently answered are first
    return sortBy(matchedQuestions, [
      (q) => {
        return -Math.max(
          ...Object.values(q.answers).map((a) => a.createdAt.seconds)
        )
      },
    ])
  })

  syncAcquiredBundles()

  return {
    bundles,
    acquiredBundles: acquiredBundlesArray,
    getList,
    getBundle,
    acquire,
    isAcquired,
    matches,
    updateAnswer,
  }
})
