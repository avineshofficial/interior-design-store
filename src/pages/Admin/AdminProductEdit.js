import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { db, storage } from '../../services/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import BackButton from '../../components/BackButton/BackButton';
import './AdminProductEdit.css';

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingImages, setExistingImages] = useState([]);

  // This hook from react-hook-form lets us "watch" the 'images' input field for changes.
  const images = watch("images");

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchProduct = async () => {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = docSnap.data();
          // Pre-fill the form with existing product data
          Object.keys(productData).forEach(key => {
            if (key !== 'images') { // Don't try to set the value of the file input
              setValue(key, productData[key]);
            }
          });
          setExistingImages(productData.images || []);
        } else {
          console.error("No such document!");
          navigate('/admin/products');
        }
      };
      fetchProduct();
    }
  }, [id, setValue, navigate]);

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return [];
    
    const filesArray = Array.from(files);
    
    const uploadPromises = filesArray.map(file => {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload failed for a file:", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              // Also store the storage path for easy deletion later
              resolve({ url: downloadURL, path: uploadTask.snapshot.ref.fullPath });
            });
          }
        );
      });
    });

    try {
      const uploadedFilesData = await Promise.all(uploadPromises);
      setUploadProgress(0);
      return uploadedFilesData; // Returns an array of objects like { url: '...', path: '...' }
    } catch (error) {
      alert("An error occurred during image upload. Please try again.");
      setLoading(false);
      return [];
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const newImagesData = await handleImageUpload(data.images);
      
      if (data.images.length > 0 && newImagesData.length === 0) {
        setLoading(false);
        return; // Stop if upload fails
      }
      
      // Extract just the URLs for saving to Firestore
      const newImageUrls = newImagesData.map(file => file.url);
      
      const productData = {
        title: data.title,
        slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        description: data.description,
        price: Number(data.price),
        category: data.category,
        stock: Number(data.stock),
        currency: 'INR',
        updatedAt: serverTimestamp(),
        // IMPORTANT: If new images were uploaded, they REPLACE the old ones.
        // If no new images were uploaded, keep the existing ones.
        images: newImageUrls.length > 0 ? newImageUrls : existingImages,
      };

      if (isEditing) {
        const productRef = doc(db, 'products', id);
        await setDoc(productRef, productData, { merge: true });
      } else {
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'products'), productData);
      }
      
      alert(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/admin/products');

    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-edit-page">
        <BackButton to="/admin/products" />
        <h1 className="page-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="product-form">
            <div className="form-group">
                <input id="title" {...register('title', { required: true })} placeholder=" " />
                <label htmlFor="title">Product Title</label>
            </div>
            {/* ... other form groups */}
             <div className="form-group">
                <textarea id="description" {...register('description', { required: true })} rows="5" placeholder=" " />
                <label htmlFor="description">Description</label>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <input id="price" type="number" {...register('price', { required: true, valueAsNumber: true })} placeholder=" "/>
                    <label htmlFor="price">Price (INR)</label>
                </div>
                <div className="form-group">
                    <input id="stock" type="number" {...register('stock', { required: true, valueAsNumber: true })} placeholder=" "/>
                    <label htmlFor="stock">Stock</label>
                </div>
                <div className="form-group">
                    <input id="category" {...register('category', { required: true })} placeholder=" "/>
                    <label htmlFor="category">Category</label>
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="images">Product Images</label>
                <input type="file" id="images" {...register('images')} multiple accept="image/*" />
            </div>
        
        {/* --- THIS IS THE NEW, SIMPLIFIED PREVIEW LOGIC --- */}
        <div className="image-preview-container">
          {/* Section 1: Show existing images ONLY if editing and NO new files are selected */}
          {isEditing && existingImages.length > 0 && (!images || images.length === 0) && (
            <>
              <p>Current Images:</p>
              <div className="image-preview-grid">
                {existingImages.map((url, index) => (
                  <img key={index} src={url} alt="Existing" className="image-preview-item" />
                ))}
              </div>
            </>
          )}

          {/* Section 2: Show preview of NEW files when they are selected */}
          {images && images.length > 0 && (
            <>
              <p>New Images Preview:</p>
              <div className="image-preview-grid">
                {Array.from(images).map((file, index) => (
                  <img key={index} src={URL.createObjectURL(file)} alt="New preview" className="image-preview-item" />
                ))}
              </div>
            </>
          )}
        </div>
        {/* --- END OF NEW LOGIC --- */}
        
        {loading && (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
              {uploadProgress > 0 ? `Uploading...` : 'Processing...'}
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
};

export default AdminProductEdit;