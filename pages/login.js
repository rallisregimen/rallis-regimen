import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

var styles = [
  "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400&display=swap');",
  "*{box-sizing:border-box;margin:0;padding:0;}",
  ":root{--maroon:#7B1A38;--maroon-dark:#5C1229;--maroon-light:#F2E8EC;--off-white:#F7F4EF;--charcoal:#1A1A1A;--mid:#4A4A4A;--gold:#B8943A;--border:rgba(123,26,56,0.12);}",
  "body{background:var(--off-white);font-family:Barlow,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;}",
  ".wrap{width:100%;max-width:440px;padding:48px 24px;}",
  ".logo{font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:14px;letter-spacing:.15em;text-transform:uppercase;color:var(--mid);margin-bottom:40px;text-align:center;cursor:pointer;}",
  ".title{font-family:Playfair Display,serif;font-size:32px;font-weight:900;color:var(--charcoal);margin-bottom:8px;text-align:center;}",
  ".title em{font-style:italic;color:var(--maroon);}",
  ".sub{font-size:14px;font-weight:300;color:var(--mid);text-align:center;margin-bottom:36px;line-height:1.6;}",
  ".fg{margin-bottom:18px;}",
  ".fl{font-family:Barlow Condensed,sans-serif;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--charcoal);display:block;margin-bottom:7px;}",
  "input{width:100%;background:white;border:1.5px solid var(--border);padding:13px 16px;font-family:Barlow,sans-serif;font-size:15px;font-weight:300;color:var(--charcoal);outline:none;transition:border-color .2s;}",
  "input:focus{border-color:var(--maroon);}",
  ".btn{width:100%;background:var(--maroon);border:none;cursor:pointer;font-family:Barlow Condensed,sans-serif;font-size:15px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:white;padding:16px;transition:background .2s;margin-top:8px;}",
  ".btn:hover:not(:disabled){background:var(--maroon-dark);}",
  ".btn:disabled{opacity:.4;cursor:not-allowed;}",
  ".err{color:#C0392B;font-size:12px;margin-top:8px;font-family:Barlow Condensed,sans-serif;font-weight:500;}",
  ".links{display:flex;justify-content:space-between;margin-top:20px;}",
  ".link{font-size:12px;font-weight:300;color:var(--mid);cursor:pointer;text-decoration:underline;}",
  ".link:hover{color:var(--maroon);}",
  ".divider{display:flex;align-items:center;gap:12px;margin:20px 0;}",
  ".divider-line{flex:1;height:1px;background:var(--border);}",
  ".divider-text{font-family:Barlow Condensed,sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mid);}"
].join(' ');

export default function LoginPage() {
  var router = useRouter();
  var emailState = useState(''); var email = emailState[0]; var setEmail = emailState[1];
  var passState = useState(''); var password = passState[0]; var setPassword = passState[1];
  var loadingState = useState(false); var loading = loadingState[0]; var setLoading = loadingState[1];
  var errState = useState(''); var err = errState[0]; var setErr = errState[1];
  var resetState = useState(false); var resetSent = resetState[0]; var setResetSent = resetState[1];

  async function handleLogin() {
    if (!email || !password) { setErr('Please enter your email and password.'); return; }
    setLoading(true); setErr('');
    try {
      var result = await supabase.auth.signInWithPassword({ email: email, password: password });
      if (result.error) throw result.error;
      router.push('/dashboard');
    } catch (e) {
      setErr('Invalid email or password. Please try again.');
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) { setErr('Enter your email address above first.'); return; }
    setLoading(true); setErr('');
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      setResetSent(true);
    } catch (e) {
      setErr('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div>
      <style>{styles}</style>
      <div className="wrap">
        <div className="logo" onClick={function() { router.push('/'); }}>Rallis Regimen</div>
        <h1 className="title">Welcome <em>back.</em></h1>
        <p className="sub">Log in to access your program, track your workouts, and chat with The Regimen.</p>

        {resetSent ? (
          <div style={{ textAlign: 'center', padding: '24px', background: 'var(--maroon-light)', border: '1px solid rgba(123,26,56,.2)' }}>
            <p style={{ fontSize: '14px', fontWeight: '300', color: 'var(--charcoal)', lineHeight: '1.6' }}>
              Password reset email sent to <strong>{email}</strong>. Check your inbox and follow the link to reset your password.
            </p>
          </div>
        ) : (
          <div>
            <div className="fg">
              <label className="fl">Email Address</label>
              <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} onKeyDown={handleKeyDown} placeholder="you@example.com" />
            </div>
            <div className="fg">
              <label className="fl">Password</label>
              <input type="password" value={password} onChange={function(e) { setPassword(e.target.value); }} onKeyDown={handleKeyDown} placeholder="Your password" />
            </div>
            {err && <div className="err">{err}</div>}
            <button className="btn" onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div className="links">
              <span className="link" onClick={handleForgotPassword}>Forgot password?</span>
              <span className="link" onClick={function() { router.push('/join'); }}>Create account</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
