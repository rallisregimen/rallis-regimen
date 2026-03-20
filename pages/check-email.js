import { useRouter } from 'next/router';

var styles = [
  "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400&display=swap');",
  "* { margin:0; padding:0; box-sizing:border-box; }",
  ":root { --maroon:#7B1A38; --off-white:#F7F4EF; --charcoal:#1A1A1A; --mid:#4A4A4A; --gold:#B8943A; }",
  "body { background:var(--off-white); font-family:Barlow,sans-serif; min-height:100vh; display:flex; align-items:center; justify-content:center; }",
  ".wrap { max-width:480px; text-align:center; padding:48px 24px; }",
  ".icon { width:72px; height:72px; background:var(--maroon); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 32px; font-size:32px; }",
  ".title { font-family:Playfair Display,serif; font-size:36px; font-weight:900; color:var(--charcoal); margin-bottom:16px; }",
  ".title em { font-style:italic; color:var(--maroon); }",
  ".sub { font-size:16px; font-weight:300; color:var(--mid); line-height:1.7; margin-bottom:12px; }",
  ".email-highlight { font-family:Barlow Condensed,sans-serif; font-weight:700; color:var(--maroon); font-size:18px; letter-spacing:0.04em; margin-bottom:32px; display:block; }",
  ".note { font-size:13px; font-weight:300; color:var(--mid); line-height:1.6; opacity:0.8; }",
  ".logo { font-family:Barlow Condensed,sans-serif; font-weight:700; font-size:13px; letter-spacing:0.15em; text-transform:uppercase; color:var(--mid); margin-bottom:48px; }"
].join(' ');

export default function CheckEmail() {
  var router = useRouter();
  var email = router.query.email || 'your email';

  return (
    <div>
      <style>{styles}</style>
      <div className="wrap">
        <div className="logo">Rallis Regimen</div>
        <div className="icon">@</div>
        <h1 className="title">Check your <em>email.</em></h1>
        <p className="sub">We sent a login link to</p>
        <span className="email-highlight">{email}</span>
        <p className="sub">Click the link in that email to access your program and complete your intake form. It expires in 1 hour.</p>
        <p className="note">Did not receive it? Check your spam folder. If it is still not there, go back and try again.</p>
      </div>
    </div>
  );
}
