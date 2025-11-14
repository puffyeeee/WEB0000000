# Unite Pet Salon Gallery

高級ペットサロン管理システム - Unite ギャラリーデザイン

## 特徴

- **Uniteギャラリーデザイン**: 静寂、品、余白を重視したギャラリーエディトリアルUI
- **完全な機能性**: Firebase認証、顧客管理、予約システム、売上管理を統合
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **エディトリアルレイアウト**: 美術館のような上品な体験

## 起動方法

```bash
npm start        # ポート5173で起動
npm run dev      # 開発モード
npm run unite    # Uniteギャラリーモード
```

## デザインシステム

### カラーパレット

ティファニー系ミルキーグラデーション（白多め透明感）：

- **左端ターコイズ(15%)**: `#A8F1E5` → `#B9F3ED`
- **白中心領域(55%)**: `#F4FBFF` → `#F7FDFF` (空気のような白)
- **右端ラベンダー(30%)**: `#EFEFFF` → `#C8A8F0`

20段階の滑らかなグラデーションで、ミルキーな発光感と透明感を実現。

### ファイル構成

```
/public/
├── index.html                   # メインページ (Unite Gallery)
├── unite-design.css             # メインデザインシステム
├── unite-components.css         # コンポーネントライブラリ
├── app.js                       # アプリケーションロジック
├── style.css                    # レガシーCSS(使用せず)
├── index-original-backup.html   # 元のバックアップ
├── arflex-gallery.html         # 旧バージョン(使用せず)
├── firebase-config.js           # Firebase設定ファイル
└── sw.js                        # Service Worker
```

## 認証・機能

### セキュアアクセス

- **Uniteギャラリーログイン画面**: 統一されたデザインでの認証
- **Firebase Authentication**: Email/Google認証
- **デモモード**: Firebase未設定時の疑似認証（改善済み）

### コア機能

- **顧客管理**: 顧客情報の登録・検索・管理
- **ペット管理**: ペット情報の登録・管理  
- **予約システム**: 予約の作成・管理・タイムライン表示
- **売上管理**: 請求・支払い・分析
- **スタッフノート**: 連絡事項・注意事項の管理
- **検索機能**: グローバル検索・フィルタリング

### デモ認証情報

```text
Email: demo@unite.gallery
Password: unite2025
```

## デザインコンセプト

### Unite Gallery Aesthetic - Tiffany Milky Gradient

- **ティファニー透明感**: 淡いターコイズから始まる上品なグラデーション
- **ミルキー白**: 空気のように軽やかな白が55%を占める中心領域
- **ラベンダーの結末**: 透明感のある薄紫が優しく溶ける
- **ガラス質感**: backdrop-filterで実現したガラスのような透け感
- **ミルキー発光**: 内部から柔らかく光るピュアな質感

### Typography

- **Primary**: Noto Sans JP (日本語)
- **Secondary**: Inter (英数字)
- **Display**: Noto Serif JP (見出し用)

## レスポンシブ対応

- **Mobile**: < 768px (スタック型レイアウト)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (フルギャラリー表示)

## 開発情報

### ファイル名統一完了

全てのファイルがUnite Galleryブランドに統一済み:

- ✅ `arflex-design.css` → `unite-design.css`
- ✅ `arflex-components.css` → `unite-components.css`
- ✅ CSS変数: `--arflex-*` → `--unite-*`
- ✅ CSSクラス: `.arflex-*` → `.unite-*`
- ✅ HTML/JS内の参照も全て更新済み

### 削除されたファイル

不要なデザインファイルを整理済み:

- `luxury-salon-design.css`
- `ultra-luxury-design.css`
- `ultra-luxury-components.css`
- `dashboard-components.css`
- その他旧デザイン関連ファイル

### バックアップ

- `index-original-backup.html`: 元の機能フル版のバックアップ

## デプロイ

### Firebase Hosting

```bash
firebase deploy --only hosting
```

### GitHub Actions

main ブランチへの push で自動デプロイ

## 機能一覧

### コアシステム

- [x] Uniteギャラリー認証システム (Email/Google/デモモード)
- [x] セキュアアクセス制御
- [x] 顧客データベース管理
- [x] ペット情報管理
- [x] 予約システム (作成・編集・削除)
- [x] 売上・請求管理
- [x] スタッフ間コミュニケーション

### UI/UX

- [x] ティファニー系ミルキーグラデーションデザイン
- [x] タイムライン型予約表示
- [x] アテンションギャラリー
- [x] 分析チャート区域
- [x] アクティビティフィード
- [x] レスポンシブ対応

### アーキテクチャ

- [x] CSS Variables ベースのテーマシステム
- [x] コンポーネント化されたUI
- [x] モジュラーJavaScript
- [x] Progressive Enhancement

## 最新更新 (2025/11/14)

### ✨ 完成版アップデート

- ✅ **ティファニー系ミルキーグラデーション完全適用**
- ✅ **Firebase認証エラー完全解決**
- ✅ **Unite Galleryブランド統一完了**
- ✅ **デモモード最適化**
- ✅ **エラーフリーで完全動作**

### 🚀 使用方法

1. **ワンクリックデモログイン**ボタンをクリック
2. またはフォームに `demo@unite.gallery` / `unite2025` を入力
3. 美しいティファニー系ミルキーグラデーションをお楽しみください！

---

*Unite Gallery Design System*  
*ティファニー系ミルキーグラデーションでプレミアムペットサロン体験を*
