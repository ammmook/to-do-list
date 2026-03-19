import { GoogleLogin } from '@react-oauth/google';

/**
 * LoginScreen — Full-page login gate.
 *
 * WHY a full-page screen (not a modal):
 * The dashboard requires authentication before any data loads.
 * A full-page login makes it clear the app is gated, and prevents
 * any flash of dashboard content before auth completes.
 *
 * The Google Sign-In button is rendered by the official Google library,
 * ensuring compliance with Google's branding guidelines.
 *
 * @param {Function} onLoginSuccess - Called with the Google credential on success
 */
function LoginScreen({ onLoginSuccess }) {

  const handleGoogleLoginSuccess = (credentialResponse) => {
    // credentialResponse.credential contains the JWT token
    // with user info (name, email, picture)
    onLoginSuccess(credentialResponse.credential);
  };

  const handleGoogleLoginError = () => {
    console.error('Google Login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm fade-in">

        {/* Branding & Welcome */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Manager</h1>
          <p className="text-slate-500 text-sm mt-1.5">Sign in to manage your academic tasks</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm text-slate-600 text-center">
              Use your Google account to sign in and access your dashboard.
            </p>

            {/* Google Sign-In Button — official component ensures branding compliance */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                theme="outline"
                size="large"
                shape="pill"
                text="signin_with"
                width="280"
              />
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Your data is synced with Google Sheets.
              <br />
              We only access your name and email.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-300 mt-6">
          Academic Dashboard · Powered by Google Sheets
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;
