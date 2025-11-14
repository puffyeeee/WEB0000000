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

10段階のブルーグラデーション配色：

- `--unite-blue-whisper` (最も淡い)
- `--unite-blue-silk`
- `--unite-blue-mist`
- `--unite-blue-pearl`
- `--unite-blue-silver`
- `--unite-blue-steel`
- `--unite-blue-graphite`
- `--unite-blue-serene`
- `--unite-blue-refined`
- `--unite-blue-midnight` (最も濃い)

### ファイル構成

```
/public/
├── index.html               # メインページ (Unite Gallery)
├── unite-design.css         # メインデザインシステム
├── unite-components.css     # コンポーネントライブラリ
├── app.js                   # アプリケーションロジック
└── index-original-backup.html # 元のバックアップ
```

## 認証・機能

### セキュアアクセス

- **Uniteギャラリーログイン画面**: 統一されたデザインでの認証
- **Firebase Authentication**: Email/Google認証
- **デモモード**: Firebase未設定時の疑似認証

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

### Unite Gallery Aesthetic

- **静けさ (Tranquility)**: 落ち着いた色調と十分な余白
- **品 (Elegance)**: 洗練されたタイポグラフィと控えめな装飾
- **余白 (White Space)**: ミニマルで美術館のようなレイアウト
- **Exhibition Feel**: ギャラリー展示のような上品な体験

### Typography

- **Primary**: Noto Sans JP (日本語)
- **Secondary**: Inter (英数字)
- **Display**: Noto Serif JP (見出し用)

## レスポンシブ対応

- **Mobile**: < 768px (スタック型レイアウト)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (フルギャラリー表示)

## 開発情報

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

- [x] Unite Galleryデザイン
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

---

*Unite Gallery Design System*  
*Designed for Premium Pet Salon Experience*
