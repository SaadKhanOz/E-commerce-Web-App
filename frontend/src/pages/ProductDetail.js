import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const ProductDetailContainer = styled.div`
  padding: 2rem 0;
`;

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <ProductDetailContainer>
      <div className="container">
        <h1>Product Detail - {id}</h1>
        <p>Product detail page coming soon...</p>
      </div>
    </ProductDetailContainer>
  );
};

export default ProductDetail;
