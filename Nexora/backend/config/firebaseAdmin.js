const admin = require('firebase-admin')

function getServiceAccountFromEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    return null
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n')
  }
}

function getStorageBucketName() {
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    return process.env.FIREBASE_STORAGE_BUCKET
  }

  if (process.env.FIREBASE_PROJECT_ID) {
    return `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
  }

  return undefined
}

if (!admin.apps.length) {
  const serviceAccount = getServiceAccountFromEnv()
  const storageBucket = getStorageBucketName()

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket
    })
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket
    })
  }
}

const db = admin.firestore()
const auth = admin.auth()

function getStorageBucket() {
  const storageBucketName = getStorageBucketName()
  if (storageBucketName) {
    return admin.storage().bucket(storageBucketName)
  }

  return admin.storage().bucket()
}

module.exports = {
  admin,
  db,
  auth,
  getStorageBucket
}
