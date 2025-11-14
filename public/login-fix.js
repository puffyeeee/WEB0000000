/* 🔧 ログイン強制表示パッチ */
/* 高級デザインとログイン機能の互換性を確保 */

// ページ読み込み時に認証状態をチェックしてモーダル表示
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 ログイン互換性パッチ 開始');
  
  // 3秒後に認証チェック（Firebase初期化待ち）
  setTimeout(function() {
    console.log('🔒 認証状態確認中...');
    
    // Firebase Authが利用可能かチェック
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
          console.log('👤 未認証ユーザー - ログインモーダル表示');
          forceShowLoginModal();
        } else {
          console.log('✅ 認証済みユーザー:', user.email);
        }
      });
    } else {
      // Firebase未初期化の場合は直接モーダル表示
      console.log('🚨 Firebase未初期化 - 直接ログインモーダル表示');
      forceShowLoginModal();
    }
  }, 3000);
});

// 強制的にログインモーダルを表示
function forceShowLoginModal() {
  console.log('🚪 ログインモーダル強制表示');
  
  const authModal = document.getElementById('authModal');
  
  if (authModal) {
    // すべての高級デザイン要素を一時的に隠す
    const luxuryApp = document.querySelector('.luxury-app');
    const luxuryHeader = document.querySelector('.luxury-header');
    
    if (luxuryApp) luxuryApp.style.display = 'none';
    if (luxuryHeader) luxuryHeader.style.display = 'none';
    
    // モーダルを表示
    authModal.style.display = 'flex';
    authModal.style.zIndex = '10000';
    authModal.classList.add('show');
    
    console.log('✅ ログインモーダル表示完了');
    
    // body のスクロールを無効化
    document.body.style.overflow = 'hidden';
  } else {
    console.error('❌ authModal 要素が見つかりません');
    
    // モーダルが見つからない場合は緊急用ログイン画面を作成
    createEmergencyLoginModal();
  }
}

// 緊急用ログイン画面作成
function createEmergencyLoginModal() {
  console.log('🆘 緊急用ログイン画面作成');
  
  const emergencyModal = document.createElement('div');
  emergencyModal.id = 'emergencyLogin';
  emergencyModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 20000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Noto Sans JP', sans-serif;
  `;
  
  emergencyModal.innerHTML = `
    <div style="
      background: white;
      padding: 2rem;
      border-radius: 16px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    ">
      <h2 style="color: #333; margin-bottom: 1rem;">🐾 表参道サロン</h2>
      <p style="color: #666; margin-bottom: 1.5rem;">ログインが必要です</p>
      
      <div style="margin-bottom: 1rem;">
        <input type="email" id="emergencyEmail" placeholder="メールアドレス" style="
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        ">
        <input type="password" id="emergencyPassword" placeholder="パスワード" style="
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        ">
      </div>
      
      <button onclick="emergencyLogin()" style="
        width: 100%;
        padding: 0.75rem;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        margin-bottom: 0.5rem;
      ">ログイン</button>
      
      <button onclick="closeEmergencyModal()" style="
        width: 100%;
        padding: 0.5rem;
        background: transparent;
        color: #666;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
      ">デモモードで続行</button>
    </div>
  `;
  
  document.body.appendChild(emergencyModal);
}

// 緊急ログイン処理
function emergencyLogin() {
  const email = document.getElementById('emergencyEmail').value;
  const password = document.getElementById('emergencyPassword').value;
  
  if (!email || !password) {
    alert('メールアドレスとパスワードを入力してください');
    return;
  }
  
  console.log('🔐 緊急ログイン試行:', email);
  
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        console.log('✅ ログイン成功');
        closeEmergencyModal();
        showMainApp();
      })
      .catch(function(error) {
        console.error('❌ ログインエラー:', error);
        alert('ログインに失敗しました: ' + error.message);
      });
  } else {
    alert('認証システムが利用できません');
  }
}

// 緊急モーダルを閉じる
function closeEmergencyModal() {
  const emergencyModal = document.getElementById('emergencyLogin');
  if (emergencyModal) {
    emergencyModal.remove();
  }
  
  // デモモードで続行
  window.location.href = '/demo.html';
}

// メインアプリ表示
function showMainApp() {
  // すべてのモーダルを隠す
  const authModal = document.getElementById('authModal');
  const emergencyModal = document.getElementById('emergencyLogin');
  
  if (authModal) {
    authModal.style.display = 'none';
    authModal.classList.remove('show');
  }
  if (emergencyModal) {
    emergencyModal.remove();
  }
  
  // 高級デザイン要素を表示
  const luxuryApp = document.querySelector('.luxury-app');
  const luxuryHeader = document.querySelector('.luxury-header');
  
  if (luxuryApp) luxuryApp.style.display = 'grid';
  if (luxuryHeader) luxuryHeader.style.display = 'flex';
  
  // body のスクロールを復元
  document.body.style.overflow = '';
  
  console.log('🏨 メインアプリ表示完了');
}

console.log('🔧 ログイン互換性パッチ 読み込み完了');