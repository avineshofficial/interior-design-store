    import React, { useEffect, useState, useCallback } from 'react';
    import { useForm } from 'react-hook-form';
    import { useNavigate } from 'react-router-dom';
    import {
    doc,
    setDoc,
    collection,
    serverTimestamp,
    getDocs
    } from 'firebase/firestore';

    import { db } from '../services/firebase';
    import { useAuth } from '../context/AuthContext';
    import { useCart } from '../context/CartContext';
    import { useToast } from '../components/Toast/Toast';
    import BackButton from '../components/BackButton/BackButton';

    import './CheckoutPage.css';

    /* --------------------------------------------------------
    Generate clean and unique order ID
    -------------------------------------------------------- */
    const generateOrderId = (length = 8) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    export default function CheckoutPage() {
    const navigate = useNavigate();

    const { currentUser, userProfile } = useAuth();
    const { cartItems, subtotal, clearCart } = useCart();
    const { addToast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch
    } = useForm();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    const selectedSavedAddress = watch('savedAddress');

    /* --------------------------------------------------------
        Fetch saved addresses for logged-in user
    -------------------------------------------------------- */
    const fetchAddresses = useCallback(async () => {
        if (!currentUser) {
        setSavedAddresses([]);
        return;
        }

        setLoadingAddresses(true);

        try {
        const ref = collection(db, 'users', currentUser.uid, 'addresses');
        const snap = await getDocs(ref);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedAddresses(data);
        } catch (err) {
        console.error('Error loading addresses:', err);
        addToast('Failed to load saved addresses', 'error');
        }

        setLoadingAddresses(false);
    }, [currentUser, addToast]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    /* --------------------------------------------------------
        Pre-fill name/email fields
    -------------------------------------------------------- */
    useEffect(() => {
        if (currentUser || userProfile) {
        reset({
            name: userProfile?.displayName || '',
            email: currentUser?.email || ''
        });
        }
    }, [currentUser, userProfile, reset]);

    /* --------------------------------------------------------
        Auto-fill new address fields when user selects a saved one
    -------------------------------------------------------- */
    const handleSavedAddressSelect = (e) => {
        const id = e.target.value;

        if (!id) {
        // Reset for new address
        setValue('addressLine1', '');
        setValue('city', '');
        setValue('state', '');
        setValue('pincode', '');
        return;
        }

        const address = savedAddresses.find(a => a.id === id);
        if (address) {
        setValue('addressLine1', address.line1 || '');
        setValue('city', address.city || '');
        setValue('state', address.state || '');
        setValue('pincode', address.pincode || '');
        }
    };

    /* --------------------------------------------------------
        Handle order placement
    -------------------------------------------------------- */
    const onSubmit = async (formData) => {
        if (!cartItems?.length) {
        addToast('Your cart is empty.', 'error');
        return navigate('/products');
        }

        // Build the final shipping address
        let finalAddress = {
        line1: formData.addressLine1,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: 'India'
        };

        // If user selected a saved address
        if (formData.savedAddress) {
        const saved = savedAddresses.find(a => a.id === formData.savedAddress);
        if (saved) {
            finalAddress = {
            line1: saved.line1,
            city: saved.city,
            state: saved.state,
            pincode: saved.pincode,
            country: saved.country || 'India'
            };
        }
        }

        try {
        const orderId = generateOrderId();

        const order = {
            id: orderId,
            customer: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email || ''
            },
            shippingAddress: finalAddress,
            items: cartItems,
            subtotal,
            notes: formData.notes || '',
            createdAt: serverTimestamp(),
            customerUid: currentUser?.uid || null,
            status: 'Pending'
        };

        // Save order
        await setDoc(doc(db, 'orders', orderId), order);

        // Save new address (if user selected that option & not using dropdown saved one)
        if (currentUser && formData.saveAddress && !formData.savedAddress) {
            const ref = doc(collection(db, 'users', currentUser.uid, 'addresses'));
            await setDoc(ref, finalAddress);
            fetchAddresses();
        }

        addToast('Order placed successfully!', 'success');
        clearCart();
        navigate(`/order-confirmation/${orderId}`);

        } catch (err) {
        console.error('Order failed:', err);
        addToast(`Order failed: ${err.message}`, 'error');
        }
    };

    /* --------------------------------------------------------
        JSX
    -------------------------------------------------------- */
    return (
        <div className="checkout-page">
        <BackButton to="/cart" />
        <h1 className="page-title">Checkout Information</h1>

        <form className="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ---------------- CONTACT INFO ---------------- */}
            <h2>Contact Information</h2>

            <div className="form-row">
            <div className="form-group">
                <input
                {...register('name', {
                    required: 'Full name is required',
                    validate: v => v.trim() !== '' || 'Full name is required'
                })}
                placeholder=" "
                />
                <label>Full Name</label>
                {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>

            <div className="form-group">
                <input
                {...register('phone', {
                    required: 'Phone number required',
                    validate: v => /^[0-9]{10}$/.test(v) || 'Enter a valid 10-digit phone number'
                })}
                placeholder=" "
                />
                <label>Phone Number</label>
                {errors.phone && <span className="error-text">{errors.phone.message}</span>}
            </div>
            </div>

            <div className="form-group">
            <input {...register('email')} placeholder=" " type="email" />
            <label>Email (Optional)</label>
            </div>

            {/* ---------------- SAVED ADDRESSES ---------------- */}
            <h2>Shipping Address</h2>

            {currentUser && (
            <div className="saved-addresses-section">
                <label className="static-label">Use a Saved Address</label>

                <select
                {...register('savedAddress')}
                className="address-select"
                onChange={handleSavedAddressSelect}
                value={selectedSavedAddress || ''}
                >
                <option value="">-- Enter a new address --</option>
                {loadingAddresses && <option disabled>Loading...</option>}
                {savedAddresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                    {addr.line1}, {addr.city}, {addr.state}
                    </option>
                ))}
                </select>

                <div className="separator"><span>OR</span></div>
            </div>
            )}

            {/* ---------------- NEW ADDRESS FORM ---------------- */}
            <div className="new-address-form">
            <div className="form-group">
                <input
                {...register('addressLine1', {
                    validate: v => selectedSavedAddress ? true : v.trim() !== '' || 'Address is required'
                })}
                placeholder=" "
                />
                <label>Address Line 1</label>
                {errors.addressLine1 && <span className="error-text">{errors.addressLine1.message}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                <input
                    {...register('city', {
                    validate: v => selectedSavedAddress ? true : v.trim() !== '' || 'City is required'
                    })}
                    placeholder=" "
                />
                <label>City</label>
                {errors.city && <span className="error-text">{errors.city.message}</span>}
                </div>

                <div className="form-group">
                <input
                    {...register('state', {
                    validate: v => selectedSavedAddress ? true : v.trim() !== '' || 'State is required'
                    })}
                    placeholder=" "
                />
                <label>State</label>
                {errors.state && <span className="error-text">{errors.state.message}</span>}
                </div>
            </div>

            <div className="form-group">
                <input
                {...register('pincode', {
                    validate: v =>
                    selectedSavedAddress ? true : /^[0-9]{6}$/.test(v) || 'Enter a valid 6-digit pincode'
                })}
                placeholder=" "
                />
                <label>Pincode</label>
                {errors.pincode && <span className="error-text">{errors.pincode.message}</span>}
            </div>
            </div>

            {currentUser && !selectedSavedAddress && (
            <div className="save-address-checkbox">
                <input type="checkbox" id="saveAddress" {...register('saveAddress')} />
                <label htmlFor="saveAddress">Save this address for future use</label>
            </div>
            )}

            {/* ---------------- NOTES ---------------- */}
            <h2>Additional Notes</h2>

            <div className="form-group">
            <textarea {...register('notes')} placeholder=" " rows={3} />
            <label>Any special delivery instructions?</label>
            </div>

            {/* ---------------- SUBMIT ---------------- */}
            <button className="place-order-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
        </form>
        </div>
    );
    }
