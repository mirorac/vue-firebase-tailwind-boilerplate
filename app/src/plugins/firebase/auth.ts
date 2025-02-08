import { app } from '@/plugins/firebase/app'
// import router from '@/router'
import { useBrowserLocation } from '@vueuse/core'
import {
  getAuth,
  connectAuthEmulator,
  type UserCredential,
  signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  linkWithPopup,
  sendPasswordResetEmail,
  signInWithCustomToken,
} from 'firebase/auth'

export const auth = getAuth(app)
auth.languageCode = 'en' // for the emails language

// connect to emulator in dev environment
if (
  import.meta.env.DEV &&
  (import.meta.env.VITE_USE_EMULATOR === undefined ||
    import.meta.env.VITE_USE_EMULATOR === 'true')
) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099')
  } catch (e) {
    console.error(e)
  }
}

export type ProviderId = 'google' | 'facebook'
type FirebaseProvider = GoogleAuthProvider | FacebookAuthProvider
type AuthenticateOptions = {
  type?: 'popup' | 'redirect'
  provider?: FirebaseProvider
}

/**
 * Creates OAuth provider with default scopes.
 */
export const createProvider = (providerId: ProviderId): FirebaseProvider => {
  let provider: FirebaseProvider, scopes: string[]
  switch (providerId) {
    case 'facebook':
      provider = new FacebookAuthProvider()
      scopes = ['public_profile', 'email']
      scopes.forEach((scope) => {
        provider.addScope(scope)
      })
      break
    case 'google':
      provider = new GoogleAuthProvider()
      scopes = ['profile', 'email']
      scopes.forEach((scope) => {
        provider.addScope(scope)
      })
      break
    default:
      throw new Error('auth/unknown-provider')
  }
  return provider
}

function verifyAuthenticateOptions(options: AuthenticateOptions) {
  if (!('provider' in options)) {
    throw new Error('auth/provider-not-set')
  }
  if (!('type' in options)) {
    options.type = 'popup'
  }
}

/**
 * Creates a temporary anonymous account to enable features for which an authentication is needed.
 *
 * @see https://firebase.google.com/docs/auth/web/anonymous-auth
 */
export const signInAnonymously = function (): Promise<UserCredential> {
  return firebaseSignInAnonymously(auth)
}

/**
 * Sign in with credentials (email, password).
 *
 * @see https://firebase.google.com/docs/auth/web/start#web-version-9_1
 */
export const signInWithEmail = async function (
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(auth, email, password)
}

/**
 * Sign up with credentials (email, password).
 *
 * @see https://firebase.google.com/docs/auth/web/start#web-version-9_1
 */
export const signUpWithEmail = async function (
  email: string,
  password: string
) {
  return createUserWithEmailAndPassword(auth, email, password)
}

/**
 * Sign in with a token.
 *
 * @see https://firebase.google.com/docs/auth/web/custom-auth
 */
export const signInWithToken = async function (token: string) {
  return signInWithCustomToken(auth, token)
}

/**
 * Links an annonymous account with a creadential from any provider (FB, GOogle, emial, etc..).
 *
 * @see https://firebase.google.com/docs/auth/web/anonymous-auth#convert-an-anonymous-account-to-a-permanent-account
 */
export const upgradeAnonymous = async (
  options: AuthenticateOptions
): Promise<UserCredential> => {
  if (!auth.currentUser) {
    throw new Error('auth/not-signed-in')
  }
  if (!auth.currentUser.isAnonymous) {
    throw new Error('auth/cannot-upgrade-account')
  }
  verifyAuthenticateOptions(options)
  if (options.type == 'redirect') {
    throw new Error('auth/not-implemented')
  } else if (options.type == 'popup') {
    return linkWithPopup(auth.currentUser, options.provider)
  } else {
    throw new Error('auth/unsupported-type')
  }
}

/**
 * @param options
 * @returns User credential or nothign, if type is redirect
 */
export const authenticateWithProvider = (
  options: AuthenticateOptions
): Promise<UserCredential> | void => {
  verifyAuthenticateOptions(options)
  if (options.type == 'redirect') {
    // timeout the redirect so we can set a destination route with vue router
    setTimeout(() => {
      signInWithRedirect(auth, options.provider)
    }, 10)
  } else if (options.type == 'popup') {
    return signInWithPopup(auth, options.provider)
  } else {
    throw new Error('auth/unsupported-type')
  }
}

export const authenticateWithGoogle = async (options: AuthenticateOptions) => {
  options.provider = createProvider('google')
  return authenticateWithProvider(options)
}

export const authenticateWithFacebook = async (
  options: AuthenticateOptions
) => {
  options.provider = createProvider('facebook')
  return authenticateWithProvider(options)
}

export const forgotPassword = async (email: string) => {
  throw new Error('Circular dependency on router/index.ts')
  return sendPasswordResetEmail(auth, email, {
    url:
      useBrowserLocation().value.origin +
      router.resolve({ name: 'login' }).href,
  })
}
