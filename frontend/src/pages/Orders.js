import React from 'react';
import styled from 'styled-components';

const OrdersContainer = styled.div`
  padding: 2rem 0;
`;

const Orders = () => {
  return (
    <OrdersContainer>
      <div className="container">
        <h1>My Orders</h1>
        <p>Order history coming soon...</p>
      </div>
    </OrdersContainer>
  );
};

export default Orders;
