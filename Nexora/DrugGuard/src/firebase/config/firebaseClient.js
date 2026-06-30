import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAlFift4ErzmB2IIgiFGNNydIgkTjSMz90',
  authDomain: 'drugguard-b7cfb.firebaseapp.com',
  projectId: 'drugguard-b7cfb',
  storageBucket: 'drugguard-b7cfb.firebasestorage.app',
  messagingSenderId: '553250877967',
  appId: '1:553250877967:web:a9ed74d97f65751521297a',
  measurementId: 'G-WCLB21JV4F'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export { app, auth }
