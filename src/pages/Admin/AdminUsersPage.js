import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import BackButton from '../../components/BackButton/BackButton';
import './AdminUsersPage.css'; // We'll create this next

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="admin-page"><p>Loading users...</p></div>;
  }

  return (
    <div className="admin-users-page">
      <BackButton to="/admin" />
      <h1 className="page-title">Manage Users</h1>
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Display Name</th>
              <th>Email</th>
              <th>User ID</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(user => (
              <tr key={user.id}>
                <td data-label="Name">{user.displayName || 'N/A'}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="User ID">{user.uid}</td>
                <td data-label="Role">
                  <span className={`role-badge role-${user.role}`}>{user.role}</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="no-items-cell">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;