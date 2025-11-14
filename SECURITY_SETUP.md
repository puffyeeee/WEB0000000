# Firebase Authentication セキュリティ実装手順

## 🔐 概要

この実装により、UIは誰でも閲覧可能ですが、すべての操作（データ読み書き、機能実行）は認証済みユーザー（あなたのみ）に制限されます。

## 🚀 実装手順

### 1. Firebase Console での設定

#### 1.1 Authentication有効化

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト「Unite」を選択
3. **Authentication** → **Sign-in method** に移動
4. 以下のプロバイダーを有効化：
   - **Email/Password**: 有効にする
   - **Google**: 有効にして認証ドメインを設定

#### 1.2 認証ユーザーの作成（あなた専用）

1. **Authentication** → **Users** タブ
2. **Add user** をクリック
3. あなたのメールアドレスとパスワードを設定
4. 他のユーザーは作成しない（あなた専用のアクセス）

### 2. Firestore・Database設定

#### 2.1 セキュリティルール適用

```bash
# プロジェクトディレクトリで実行
firebase deploy --only firestore:rules
firebase deploy --only database
```

#### 2.2 ルール確認

- Firestore Rules: 認証ユーザーのみ読み書き可能
- Realtime Database Rules: 認証ユーザーのみアクセス可能

### 3. Cloud Functions設定

#### 3.1 Functions デプロイ

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

#### 3.2 環境変数設定（機密情報保護）

```bash
# フィードバック送信先メール設定
firebase functions:config:set feedback.email="duffy.chocolate.aya@gmail.com"

# SMTP設定（必要に応じて）
firebase functions:config:set smtp.user="your-smtp-user"
firebase functions:config:set smtp.pass="your-smtp-pass"
```

### 4. フロントエンド設定

#### 4.1 Firebase設定更新

`public/app.js` の firebaseConfig を実際の値に更新：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "unite-e8567.firebaseapp.com", 
  projectId: "unite-e8567",
  storageBucket: "unite-e8567.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**注意**: これらは公開情報で機密情報ではありません。

#### 4.2 デプロイ

```bash
firebase deploy --only hosting
```

## 🛡️ セキュリティ確認

### テスト手順

1. **未認証状態でのテスト**:
   - ブラウザでサイトにアクセス
   - UI は正常に表示される
   - 各ボタンをクリック → ログイン画面が表示される
   - データは読み込まれない

2. **認証後のテスト**:
   - ログインボタンからログイン
   - 全機能が正常に動作する
   - データの読み書きが可能

3. **Cloud Functions テスト**:

   ```javascript
   // 未認証での関数呼び出し → エラー
   // 認証後の関数呼び出し → 成功
   ```

## 🔧 運用設定

### Google認証設定（推奨）

1. **Google Cloud Console** で OAuth 2.0 設定
2. 認証ドメインに `unite-e8567.firebaseapp.com` を追加
3. あなたのGoogleアカウントでのログインを許可

### メール設定

1. フィードバック機能用のメール設定
2. SendGrid または Gmail API の設定（推奨）

## 📋 最終チェックリスト

- [ ] Firebase Authentication が有効
- [ ] あなたのユーザーアカウントのみ作成済み  
- [ ] Firestore セキュリティルール適用済み
- [ ] Realtime Database セキュリティルール適用済み
- [ ] Cloud Functions 認証ガード実装済み
- [ ] フロントエンド認証システム統合済み
- [ ] 機密情報は環境変数で管理
- [ ] .gitignore で機密ファイル除外設定
- [ ] 未認証でのUI表示確認
- [ ] 認証後の全機能動作確認

## 🚨 セキュリティ注意点

1. **機密情報の取り扱い**
   - メールアドレス、APIキー、パスワードはコードに直接記載しない
   - 環境変数や Firebase Functions config を使用

2. **認証の確認**
   - すべての重要な操作で認証状態をチェック
   - クライアントサイドとサーバーサイド両方で認証を確認

3. **定期的な確認**
   - セキュリティルールの定期的な見直し
   - 認証ログの確認（Firebase Console）

## 🎯 達成される最終状態

✅ **UI公開**: 誰でもサイトを見ることができる  
✅ **操作制限**: ログインしたあなたのみが操作可能  
✅ **データ保護**: 未認証ユーザーはデータアクセス不可  
✅ **機能制限**: 未認証ユーザーは機能実行不可  
✅ **セキュリティ**: 不正アクセス・操作を完全防止  

これで「サイトの見た目だけ」誰でも見ることができ、「操作」はログインしたあなただけが可能な状態が実現されます。
