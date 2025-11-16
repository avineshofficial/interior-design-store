import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc'; // Google icon
import './SignInPage.css';

const SignInPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, signInWithGoogle } = useAuth(); // Make sure signInWithGoogle is imported from context
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      await login(data.email, data.password);
      navigate('/admin'); 
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    }
    setLoading(false);
  };

  // --- THIS IS THE MISSING FUNCTION THAT CAUSED THE ERROR ---
  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/admin');
    } catch (error) {
       setError('Failed to sign in with Google.');
    }
     setLoading(false);
  }
  // --- END OF MISSING FUNCTION ---

  return (
    <div className="signin-page">
      <div className="signin-card">
       <h2>Login</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <input
              id="email"
              type="email"
              placeholder=" "
              {...register('email', { required: 'Email is required' })}
            />
            <label htmlFor="email">Email</label>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          {/* --- CORRECTED STRUCTURE FOR PASSWORD --- */}
          <div className="form-group">
            <input
              id="password"
              type="password"
              placeholder=" "
              {...register('password', { required: 'Password is required' })}
            />
            <label htmlFor="password">Password</label>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>
          
          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="separator">OR</div>
        
        <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
            <FcGoogle /> Sign In with Google
        </button>

        <p className="switch-auth-mode">
            Don't have an account? <Link to="/auth/signup">Sign Up</Link>
        </p>

      </div>
    </div>
  );
};

export default SignInPage;