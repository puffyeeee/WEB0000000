# Arflex 2025-26 Collection | Pet Salon Gallery

Arflex 2025-26 Collection の世界観にインスパイアされた高級ペットサロン管理システム。
静寂、品、余白を重視したギャラリー・エディトリアル風デザインシステム。

## デザインコンセプト

### Arflex Gallery Aesthetic

- **静けさ (Tranquility)**: 落ち着いた色調と十分な余白
- **品 (Elegance)**: 洗練されたタイポグラフィと控えめな装飾
- **余白 (White Space)**: ミニマルで美術館のようなレイアウト
- **Exhibition Feel**: ギャラリー展示のような体験

### Color Philosophy

既存のブルーグラデーションを基調とした10段階カラーシステム：

```css
--arflex-blue-whisper: #f8fafc    /* 最も淡いブルー */
--arflex-blue-silk: #f1f5f9       /* シルクのような質感 */
--arflex-blue-mist: #e2e8f0       /* 朝霧のような */
--arflex-blue-pearl: #cbd5e1      /* 真珠のような光沢 */
--arflex-blue-silver: #94a3b8     /* 上品なシルバー */
--arflex-blue-steel: #64748b      /* 洗練されたスチール */
--arflex-blue-graphite: #475569   /* グラファイトの深み */
--arflex-blue-serene: #334155     /* 穏やかな深いブルー */
--arflex-blue-refined: #1e293b    /* 洗練された濃紺 */
--arflex-blue-midnight: #0f172a   /* ミッドナイトブルー */
```

## 🏗️ Architecture

### Design System Files

```
/public/
├── arflex-design.css        # メインデザインシステム
├── arflex-components.css    # コンポーネントライブラリ
├── arflex-gallery.html      # メインギャラリーページ
└── ultra-luxury.html        # 前バージョン（比較用）
```

### Typography System

- **Primary**: Noto Sans JP (日本語)
- **Secondary**: Inter (英数字・ラテン文字)
- **Display**: Noto Serif JP (見出し用)
- **English**: Inter (英語表記用)

### Spacing & Layout

```css
--arflex-space-xs: 0.25rem     /* 4px */
--arflex-space-sm: 0.5rem      /* 8px */
--arflex-space-md: 0.75rem     /* 12px */
--arflex-space-lg: 1rem        /* 16px */
--arflex-space-xl: 1.5rem      /* 24px */
--arflex-space-2xl: 2rem       /* 32px */
--arflex-space-3xl: 3rem       /* 48px */
--arflex-space-4xl: 4rem       /* 64px */
--arflex-space-5xl: 6rem       /* 96px */
```

## Usage

### Local Development

```bash
# Arflex Gallery版で起動 (推奨)
npm run arflex

# または通常の起動
npm start

# 開発モード (ポート3000)
npm run dev
```

### Available Endpoints

- `/` - Arflex Gallery (デフォルト)
- `/arflex-gallery.html` - フルArflexデザイン
- `/ultra-luxury.html` - 前バージョン (比較用)
- `/demo.html` - デモ版
- `/working.html` - シンプル版

## Component Guide

### Gallery Components

#### Timeline Exhibition

```html
<div class="arflex-timeline">
  <div class="arflex-timeline-item">
    <div class="arflex-timeline-time">09:00</div>
    <div class="arflex-timeline-content">...</div>
    <div class="arflex-timeline-status">...</div>
  </div>
</div>
```

#### Attention Gallery

```html
<div class="arflex-attention-card">
  <div class="arflex-attention-header">...</div>
  <p class="arflex-attention-note">...</p>
  <div class="arflex-attention-tags">...</div>
</div>
```

#### Analytics Exhibition

```html
<div class="arflex-analytics">
  <div class="arflex-analytics-header">...</div>
  <div class="arflex-chart-area">...</div>
</div>
```

### Button System

```html
<!-- Primary Action -->
<button class="arflex-btn arflex-btn-primary">
  <i data-feather="plus-circle"></i>
  Primary Action
</button>

<!-- Outline Style -->
<button class="arflex-btn arflex-btn-outline">
  Secondary Action
</button>

<!-- Ghost Style -->
<button class="arflex-btn arflex-btn-ghost">
  Subtle Action
</button>
```

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations

- スタック型レイアウトに自動変換
- タッチフレンドリーなボタンサイズ
- 読みやすいフォントサイズ調整

## Design Philosophy

### Arflex Inspiration

1. **Editorial Layouts** - 雑誌のような美しいレイアウト
2. **Gallery Experience** - 美術館のような上品な体験
3. **Minimalist Approach** - 無駄を削ぎ落としたミニマルデザイン
4. **Premium Materials** - 高級感のある素材感
5. **Thoughtful Typography** - 読みやすく美しい文字組み

### Pet Salon Context

- **Guest-Centric** - ペットを「ゲスト」として扱う
- **Service Exhibition** - サービスを展示作品のように提示
- **Calm Environment** - 落ち着いた環境でのケア
- **Professional Excellence** - プロフェッショナルな品質

## Customization

### Color Variations

デザインシステムのCSS変数を調整することで、簡単に色調を変更可能：

```css
:root {
  --arflex-blue-serene: #your-color;
  --arflex-blue-refined: #your-dark-color;
}
```

### Typography Adjustments

```css
:root {
  --arflex-text-scale: 1.125;  /* タイポグラフィスケール調整 */
  --arflex-line-height-base: 1.6;  /* 行間調整 */
}
```

### Spacing Modifications

```css
:root {
  --arflex-space-unit: 0.25rem;  /* ベーススペーシング調整 */
}
```

## Performance

### Optimization Features

- **CSS Variables** - 効率的なテーマ管理
- **Minimal JavaScript** - 軽量なインタラクション
- **Semantic HTML** - アクセシブルな構造
- **Progressive Enhancement** - 段階的機能向上

### Loading Strategy

1. Critical CSS inlined
2. Non-critical CSS lazy-loaded
3. Icons loaded on-demand
4. Images with lazy loading

## Comparison with Previous Versions

| Feature | Arflex Gallery | Ultra-Luxury | Original |
|---------|----------------|--------------|----------|
| Design | Editorial/Gallery | Executive/Hotel | Basic Web |
| Colors | Blue Gradient | Champagne/Navy | Primary Colors |
| Layout | Exhibition | Dashboard | Grid |
| Typography | Editorial | Executive | Standard |
| Mood | Tranquil | Luxurious | Functional |

## Future Enhancements

### Phase 2 Features

- [ ] 顧客ポートフォリオページ
- [ ] サービスギャラリー
- [ ] スタッフ紹介展示
- [ ] ビフォー/アフターギャラリー

### Phase 3 Expansions

- [ ] アニメーション強化
- [ ] インタラクティブチャート
- [ ] カスタムフォトギャラリー
- [ ] 予約フロー最適化

## Support

デザインシステムに関する質問や改善提案：

- デザインコンセプトの詳細説明
- コンポーネントの使用方法
- カスタマイゼーションサポート
- Arflexインスピレーションの詳細

---

*Inspired by Arflex 2025-26 Collection*  
*Designed for Premium Pet Salon Experience*
