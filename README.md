# 自動デプロイ (GitHub Actions → Firebase Hosting)

このリポジトリは main ブランチへの push をトリガーに Firebase Hosting へ自動デプロイされるよう、GitHub Actions ワークフローを含みます。

## 追加ファイル
- `.github/workflows/firebase-hosting.yml` — main ブランチへの push 時にビルド（存在すれば）と Firebase Hosting へのデプロイを実行します。

## 必要な GitHub Secrets
ワークフローが動作するために、リポジトリの Settings → Secrets and variables → Actions に以下を追加してください。

- `FIREBASE_SERVICE_ACCOUNT` — Firebase のサービスアカウント JSON（フル JSON テキスト）。
- `FIREBASE_PROJECT_ID` — デプロイ先の Firebase プロジェクト ID（例: `my-firebase-project`）。

### サービスアカウントの作成手順（GUI）
1. Firebase Console にアクセスし対象プロジェクトを選択。
2. 左下の歯車 → `プロジェクトの設定` を開く。
3. `サービスアカウント` タブへ移動し、`新しい秘密鍵を生成` をクリック。
4. ダウンロードした JSON ファイルの中身を GitHub の `FIREBASE_SERVICE_ACCOUNT` シークレットにそのまま貼り付けて保存。
5. `FIREBASE_PROJECT_ID` にプロジェクト ID を設定。

### 代替: CLI トークン方式
サービスアカウントの代わりに `firebase login:ci` で取得したトークンを `FIREBASE_TOKEN` という名前で保存し、別のアクション（例: `w9jds/firebase-action`）を使うこともできます。ただしサービスアカウントのほうが権限管理が柔軟で推奨されます。

## ワークフローの流れ
1. `actions/checkout` でコードをチェックアウト
2. Node をセットアップ（v20）
3. `npm ci` を実行
4. `npm run build --if-present` を実行（`package.json` に `build` が無ければ何もしません）
5. Firebase の GitHub Action を使って `public` ディレクトリをホスティングへデプロイ

## 注意点 / トラブルシュート
- ワークフローが失敗した場合、まずは Actions の実行ログを確認してください。
- `FIREBASE_SERVICE_ACCOUNT` は JSON 全体を秘密として扱います。絶対に公開しないでください。
- プロジェクトに Service Worker（`/sw.js`）やキャッシュポリシーがある場合、`index.html` のキャッシュ制御や `firebase.json` のヘッダ設定を調整して、更新がユーザーに速やかに行き渡るようにしてください（例を別途 README に追加できます）。

---

必要なら、`firebase.json` のキャッシュヘッダ例や、トークン方式のワークフロー例も追加します。どうしますか？
