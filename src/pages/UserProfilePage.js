import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FaUserCircle } from 'react-icons/fa';
import BackButton from '../components/BackButton/BackButton';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // When the component loads or the user profile data changes,
    // pre-fill the form with the current user's data.
    if (userProfile) {
      setImagePreview(userProfile.photoURL || '');
      reset({
        displayName: userProfile.displayName || '',
        email: currentUser?.email || ''
      });
    }
  }, [userProfile, reset, currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a temporary URL to show an instant preview of the new image
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      let photoURL = userProfile.photoURL; // Start with the existing photo URL

      // If a new image file was selected, upload it first.
      if (imageFile) {
        // Create a storage reference
        const storageRef = ref(storage, `profile-images/${currentUser.uid}/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        photoURL = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      // Update the user document in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: data.displayName,
        photoURL: photoURL // This is either the new URL or the existing one
      });

      // Refresh the user profile data in the auth context to show changes everywhere
      await refreshUserProfile(currentUser.uid);
      setSuccess('Profile updated successfully!');
      setImageFile(null); // Clear the selected file after upload
      setUploadProgress(0);

    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };
  
  // A loading state while the initial user profile is being fetched.
  if (!userProfile) {
    return (
      <div className="profile-page loading-state">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="profile-page">
      <BackButton />
      <h1 className="page-title">My Profile</h1>
      <div className="profile-content">
        <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
          <div className="profile-picture-section">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="profile-avatar" />
            ) : (
              <FaUserCircle className="profile-avatar-placeholder" />
            )}
            <label htmlFor="photo-upload" className="edit-photo-button">Change Photo</label>
            <input id="photo-upload" type="file" onChange={handleImageChange} accept="image/*" />
             {uploadProgress > 0 && uploadProgress < 100 && <p className="upload-progress">Uploading: {Math.round(uploadProgress)}%</p>}
          </div>

          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
          <input id="displayName" type="text" {...register('displayName', { required: true })} placeholder=" " />
          <label htmlFor="displayName">Display Name</label>
        </div>

        <div className="form-group">
          <input type="email" disabled {...register('email')} placeholder=" " />
          <label>Email</label>
        </div>

        <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;