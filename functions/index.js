/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest, onCall } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require('firebase-admin');

// Firebase Admin SDKを初期化
admin.initializeApp();

// コスト制御のためのグローバル設定
setGlobalOptions({ maxInstances: 10 });

// === 認証ガード関数 ===
function requireAuth(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'この操作を実行するにはログインが必要です。'
    );
  }
  return context.auth;
}

function requireAuthHTTP(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('認証トークンが必要です');
  }
  
  const token = authHeader.split(' ')[1];
  return admin.auth().verifyIdToken(token);
}

// === 改善要望送信機能（認証必須） ===
exports.submitFeedback = onCall(async (request) => {
  try {
    // 認証チェック
    const auth = requireAuth(request);
    logger.info('Feedback submission from authenticated user:', auth.uid);
    
    const { feedback, category = 'general' } = request.data;
    
    if (!feedback || feedback.trim().length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'フィードバック内容が空です。'
      );
    }
    
    // Firestoreにフィードバックを保存
    const feedbackDoc = {
      userId: auth.uid,
      userEmail: auth.token?.email || 'unknown',
      feedback: feedback.trim(),
      category: category,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'new'
    };
    
    const docRef = await admin.firestore()
      .collection('feedback')
      .add(feedbackDoc);
    
    logger.info('Feedback saved:', docRef.id);
    
    return {
      success: true,
      message: 'フィードバックが正常に送信されました。',
      feedbackId: docRef.id
    };
    
  } catch (error) {
    logger.error('Error submitting feedback:', error);
    throw new functions.https.HttpsError(
      'internal',
      'フィードバック送信中にエラーが発生しました。'
    );
  }
});

// === データ操作関数（認証必須） ===
exports.getData = onCall(async (request) => {
  const auth = requireAuth(request);
  const { collection, docId } = request.data;
  
  try {
    const doc = await admin.firestore()
      .collection(collection)
      .doc(docId)
      .get();
    
    return {
      success: true,
      data: doc.exists ? doc.data() : null
    };
  } catch (error) {
    logger.error('Error getting data:', error);
    throw new functions.https.HttpsError('internal', 'データ取得エラー');
  }
});

exports.setData = onCall(async (request) => {
  const auth = requireAuth(request);
  const { collection, docId, data } = request.data;
  
  try {
    await admin.firestore()
      .collection(collection)
      .doc(docId)
      .set(data, { merge: true });
    
    return { success: true };
  } catch (error) {
    logger.error('Error setting data:', error);
    throw new functions.https.HttpsError('internal', 'データ保存エラー');
  }
});

// === セキュアなHTTPエンドポイント ===
exports.secureApi = onRequest(async (req, res) => {
  try {
    // CORSヘッダーを設定
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).send();
      return;
    }
    
    // 認証チェック
    const decodedToken = await requireAuthHTTP(req);
    logger.info('Authenticated API access:', decodedToken.uid);
    
    res.status(200).json({
      success: true,
      message: '認証済みAPIアクセス',
      userId: decodedToken.uid
    });
    
  } catch (error) {
    logger.error('API authentication error:', error);
    res.status(401).json({
      success: false,
      error: '認証が必要です'
    });
  }
});
