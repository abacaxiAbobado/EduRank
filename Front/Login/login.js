const API = 'http://localhost:3000';

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('form-login').classList.toggle('active', tab === 'login');
  document.getElementById('form-register').classList.toggle('active', tab === 'register');
  hideMsg();
}

function showMsg(text, type) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.className = 'msg ' + type;
}

function hideMsg() {
  const el = document.getElementById('msg');
  el.className = 'msg';
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="spinner"></span>Aguarde...' : btn.dataset.label;
}

document.getElementById('btn-login').dataset.label = 'Entrar';
document.getElementById('btn-register').dataset.label = 'Criar conta';

async function handleLogin(e) {
  e.preventDefault();
  hideMsg();
  setLoading('btn-login', true);
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showMsg('Login realizado! Redirecionando...', 'success');
    setTimeout(() => window.location.href = 'index.html', 1000);
  } catch (err) {
    showMsg(err.message || 'Erro ao fazer login.', 'error');
  } finally {
    setLoading('btn-login', false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  hideMsg();
  setLoading('btn-register', true);
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showMsg('Conta criada! Redirecionando...', 'success');
    setTimeout(() => window.location.href = 'index.html', 1000);
  } catch (err) {
    showMsg(err.message || 'Erro ao criar conta.', 'error');
  } finally {
    setLoading('btn-register', false);
  }
}

if (localStorage.getItem('token')) window.location.href = 'index.html';