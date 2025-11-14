# 🎨 Arflex 2025-26 Collection | Pet Salon Gallery

高級ペットサロン管理システム - Arflex Collection インスパイアードデザイン

## ✨ 特徴

- **Arflex 2025-26 Collection風デザイン**: 静寂、品、余白を重視したギャラリーエディトリアルUI
- **完全な機能性**: Firebase認証、顧客管理、予約システム、売上管理を統合
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **エディトリアルレイアウト**: 美術館のような上品な体験

## 🚀 起動方法

```bash
npm start        # ポート5173で起動
npm run dev      # 開発モード
npm run arflex   # Arflexモード
```

## 🎨 デザインシステム

### カラーパレット
10段階のブルーグラデーション配色：
- `--arflex-blue-whisper` (最も淡い)
- `--arflex-blue-silk` 
- `--arflex-blue-mist`
- `--arflex-blue-pearl`
- `--arflex-blue-silver`
- `--arflex-blue-steel`
- `--arflex-blue-graphite`
- `--arflex-blue-serene`
- `--arflex-blue-refined`
- `--arflex-blue-midnight` (最も濃い)

### ファイル構成
```
/public/
├── index.html               # メインページ (Arflex Gallery)
├── arflex-design.css        # メインデザインシステム
├── arflex-components.css    # コンポーネントライブラリ
├── app.js                   # アプリケーションロジック
└── index-original-backup.html # 元のバックアップ
```

## 🔐 認証・機能

- **Firebase Authentication**: Email/Google認証
- **顧客管理**: 顧客情報の登録・検索・管理
- **ペット管理**: ペット情報の登録・管理  
- **予約システム**: 予約の作成・管理・タイムライン表示
- **売上管理**: 請求・支払い・分析
- **スタッフノート**: 連絡事項・注意事項の管理
- **検索機能**: グローバル検索・フィルタリング

## 🎭 デザインコンセプト

### Arflex Gallery Aesthetic
- **静けさ (Tranquility)**: 落ち着いた色調と十分な余白
- **品 (Elegance)**: 洗練されたタイポグラフィと控えめな装飾
- **余白 (White Space)**: ミニマルで美術館のようなレイアウト
- **Exhibition Feel**: ギャラリー展示のような上品な体験

### Typography
- **Primary**: Noto Sans JP (日本語)
- **Secondary**: Inter (英数字)
- **Display**: Noto Serif JP (見出し用)

## 📱 レスポンシブ対応

- **Mobile**: < 768px (スタック型レイアウト)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (フルギャラリー表示)

## 🔧 開発情報

### 削除されたファイル
不要なデザインファイルを整理済み:
- `luxury-salon-design.css`
- `ultra-luxury-design.css` 
- `ultra-luxury-components.css`
- `dashboard-components.css`
- その他旧デザイン関連ファイル

### バックアップ
- `index-original-backup.html`: 元の機能フル版のバックアップ

## 🌐 デプロイ

### Firebase Hosting
```bash
firebase deploy --only hosting
```

### GitHub Actions
main ブランチへの push で自動デプロイ

## 📊 機能一覧

### コアシステム
- [x] Firebase認証 (Email/Google)
- [x] 顧客データベース管理
- [x] ペット情報管理
- [x] 予約システム (作成・編集・削除)
- [x] 売上・請求管理
- [x] スタッフ間コミュニケーション

### UI/UX
- [x] Arflex Gallery風デザイン
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

*Inspired by Arflex 2025-26 Collection*  
*Designed for Premium Pet Salon Experience* 🎨✨