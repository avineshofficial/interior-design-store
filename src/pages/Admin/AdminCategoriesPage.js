import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db, storage } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import BackButton from '../../components/BackButton/BackButton';
import './AdminCategoriesPage.css';

const AdminCategoriesPage = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setValue('name', category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (data) => {
    setFormLoading(true);
    const newImageFile = data.image?.[0];

    try {
      if (editingCategory) { // UPDATE logic
        const categoryRef = doc(db, 'categories', editingCategory.id);
        let updatedData = { name: data.name };
        if (newImageFile) {
          const newStorageRef = ref(storage, `categories/${Date.now()}_${newImageFile.name}`);
          const uploadTask = uploadBytesResumable(newStorageRef, newImageFile);
          const newImageUrl = await getDownloadURL((await uploadTask).ref);
          updatedData.imageUrl = newImageUrl;
          updatedData.storagePath = newStorageRef.fullPath;
          if (editingCategory.storagePath) {
            await deleteObject(ref(storage, editingCategory.storagePath));
          }
        }
        await updateDoc(categoryRef, updatedData);
        alert('Category updated successfully!');
      } else { // ADD NEW logic
        if (!newImageFile) throw new Error("Image is required.");
        const storageRef = ref(storage, `categories/${Date.now()}_${newImageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, newImageFile);
        const imageUrl = await getDownloadURL((await uploadTask).ref);
        await addDoc(collection(db, 'categories'), { name: data.name, imageUrl, storagePath: storageRef.fullPath });
      }
      handleCancelEdit(); // Reset form
    } catch (error) {
      console.error("Operation failed:", error);
      alert("An error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'categories', category.id));
      if (category.storagePath) {
        await deleteObject(ref(storage, category.storagePath));
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="admin-page">
      <BackButton to="/admin" />
      <h1 className="page-title">Manage Categories</h1>
      <div className="admin-content-split">
        <div className="form-container">
          <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Form content remains the same... */}
            <div className="form-group">
                <input 
                    id="name" 
                    {...register('name', { required: 'Name is required.' })} 
                    placeholder=" " /* The space is important for the CSS selector */
                />
                <label htmlFor="name">Category Name</label>
            </div>
            
            <div className="form-group">
                {/* The label for file input should be static (not floating) */}
                <label className="static-label" htmlFor="image">
                    {editingCategory ? 'Upload New Image (Optional)' : 'Category Image'}
                </label>
                <input 
                    id="image" 
                    type="file" 
                    {...register('image', { required: !editingCategory })} 
                    accept="image/*" 
                />
            </div>
            <div className="form-actions">
              {editingCategory && (
                <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
              )}
              <button type="submit" className="submit-btn" disabled={formLoading}>
                {formLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Add Category')}
              </button>
            </div>
          </form>
        </div>
        <div className="list-container">
          <h3>Existing Categories</h3>
          {loading ? <p>Loading...</p> : (
            <div className="category-list">
              {categories.map(cat => (
                <div key={cat.id} className="category-item-admin">
                  <div className="category-info-main">
                    <img src={cat.imageUrl} alt={cat.name} className="category-image-admin" />
                    <span className="category-name-admin">{cat.name}</span>
                  </div>
                  <div className="category-actions">
                    <button onClick={() => handleEdit(cat)} className="action-btn-cat edit-btn-cat">Edit</button>
                    <button onClick={() => handleDelete(cat)} className="action-btn-cat delete-btn-cat">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;