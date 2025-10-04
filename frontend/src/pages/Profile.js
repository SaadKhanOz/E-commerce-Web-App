import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const ProfileContainer = styled.div`
  padding: 2rem 0;
`;

const Profile = () => {
  const { user } = useAuth();

  return (
    <ProfileContainer>
      <div className="container">
        <h1>Profile</h1>
        {user ? (
          <div className="card">
            <h2>Welcome, {user.firstName} {user.lastName}!</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        ) : (
          <p>Please log in to view your profile.</p>
        )}
      </div>
    </ProfileContainer>
  );
};

export default Profile;
