import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc'; // Google icon
import './SignInPage.css'; // Re-use the same styles as the sign-in page

const SignUpPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onEmailSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      return setError("Passwords do not match.");
    }
    try {
      setError('');
      setLoading(true);
      // Pass the displayName to the signUp function
      await signUp(data.email, data.password, data.displayName);
      navigate('/admin'); 
    } catch (err) {
      setError('Failed to create an account. The email may already be in use.');
    }
    setLoading(false);
  };
  
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

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h2>Create Account</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit(onEmailSubmit)}>
          
          <div className="form-group">
            <input id="displayName" type="text" {...register('displayName', { required: 'Display Name is required' })} placeholder=" "/>
            <label htmlFor="displayName">Display Name</label>
            {errors.displayName && <p className="error-text">{errors.displayName.message}</p>}
          </div>

          <div className="form-group">
            <input id="email" type="email" {...register('email', { required: 'Email is required' })} placeholder=" "/>
            <label htmlFor="email">Email</label>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <input id="password" type="password" {...register('password', { required: 'Password is required', minLength: 6 })} placeholder=" "/>
            <label htmlFor="password">Password</label>
            {errors.password && <p className="error-text">Password must be at least 6 characters.</p>}
          </div>
          
          <div className="form-group">
            <input id="confirmPassword" type="password" {...register('confirmPassword', { required: 'Please confirm your password' })} placeholder=" "/>
            <label htmlFor="confirmPassword">Confirm Password</label>
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
          </div>
          
          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p className="switch-auth-mode">
          Already have an account? <Link to="/auth/signin">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;