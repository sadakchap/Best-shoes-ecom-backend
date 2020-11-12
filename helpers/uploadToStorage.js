const { v4: uuidv4 } = require('uuid');
const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
const bucket = admin.storage().bucket(bucketName);

const uploadImage = async (file) => {
    const filename = file.path;
    const metadata = {
        metadata: {
            // This line is very important. It's to create a download token.
            firebaseStorageDownloadTokens: uuidv4()
        },
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
    };
    try {
        const uploads = await bucket.upload(filename, {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            gzip: true,
            metadata
        });
        const uploadedFile = uploads[0];
        const token = uploadedFile.metadata.metadata.firebaseStorageDownloadTokens;
        const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${uploadedFile.name}?alt=media&token=${token}`;
        return {success: true , downloadURL};
    } catch (err) {
        console.log(err);
        return { error: err.message, errCode: err.code };
    }
};

module.exports = uploadImage;