import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc } from 'firebase/firestore';
import BackButton from '../components/BackButton/BackButton';
import './UserAddressesPage.css';

const UserAddressesPage = () => {
  const { currentUser } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // This `useEffect` now correctly depends on `currentUser`
  useEffect(() => {
    // If there is no logged-in user, do nothing.
    if (!currentUser) {
      setLoading(false);
      return; 
    }
    
    setLoading(true);
    const addressesRef = collection(db, 'users', currentUser.uid, 'addresses');
    const q = query(addressesRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userAddresses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAddresses(userAddresses);
      setLoading(false);
    });
    
    return () => unsubscribe(); // Cleanup on exit
  }, [currentUser]);

  // --- Add new address ---
  const onSubmit = async (data) => {
    setFormLoading(true);
    try {
      const addressesRef = collection(db, 'users', currentUser.uid, 'addresses');
      await addDoc(addressesRef, data);
      reset();
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to save address.');
    } finally {
      setFormLoading(false);
    }
  };

  // --- Delete an address ---
  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'addresses', addressId));
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address.');
    }
  };

  if (!currentUser) {
     return (
      <div style={{ padding: '100px', textAlign: 'center', fontSize: '1.2rem' }}>
        Please log in to manage your addresses.
      </div>
    );
  }
  // --- END OF FIX ---

  return (
    <div className="addresses-page-container">
      <BackButton />
      <h1 className="page-title">My Addresses</h1>
      <div className="addresses-page-layout">
        <div className="address-form-container">
          <h2 className="section-title-small">Add a New Address</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="address-form">
              <div className="form-group">
                <input {...register("line1", { required: true })} placeholder=" " />
                <label>Address Line 1*</label>
              </div>
              <div className="form-group">
                <input {...register("line2")} placeholder=" " />
                <label>Address Line 2 (Optional)</label>
              </div>
              <div className="form-row">
                <div className="form-group">
                    <input {...register("city", { required: true })} placeholder=" " />
                    <label>City*</label>
                </div>
                <div className="form-group">
                    <input {...register("state", { required: true })} placeholder=" " />
                    <label>State*</label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                    <input {...register("pincode", { required: true, pattern: /^[0-9]{6}$/ })} placeholder=" " />
                    <label>Pincode*</label>
                </div>
                <div className="form-group">
                    <input {...register("country", { required: true })} defaultValue="India" placeholder=" "/>
                    <label>Country*</label>
                </div>
              </div>
              {errors.pincode && <p className="error-text">Valid 6-digit Pincode is required.</p>}
              <button type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Address'}</button>
          </form>
        </div>

        <div className="address-list-section">
          <h2 className="section-title-small">My Saved Addresses</h2>
          {/* List display logic remains the same */}
          {loading ? <p>Loading addresses...</p> : (
            addresses.length === 0 ? <p className="no-addresses">You have no saved addresses.</p> : (
              <div className="address-grid">
                {addresses.map(addr => (
                  <div key={addr.id} className="address-card">
                    <address>
                        {addr.line1}<br/>
                        {addr.line2 && <>{addr.line2}<br/></>}
                        {addr.city}, {addr.state} - {addr.pincode}<br/>
                        {addr.country}
                    </address>
                     <button onClick={() => handleDelete(addr.id)} className="delete-btn">Delete</button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAddressesPage;