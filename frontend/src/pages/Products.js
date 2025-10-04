import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from 'react-query';

const ProductsContainer = styled.div`
  padding: 2rem 0;
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #ccc;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ProductPrice = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #666;
`;

const AddToCartBtn = styled.button`
  width: 100%;
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #0056b3;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin: 2rem 0;
`;

const fetchProducts = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/products?${queryString}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: parseInt(searchParams.get('page')) || 1
  });

  const { data, isLoading, error } = useQuery(
    ['products', filters],
    () => fetchProducts(filters),
    {
      keepPreviousData: true
    }
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  if (isLoading) {
    return (
      <ProductsContainer>
        <div className="container">
          <LoadingSpinner>Loading products...</LoadingSpinner>
        </div>
      </ProductsContainer>
    );
  }

  if (error) {
    return (
      <ProductsContainer>
        <div className="container">
          <ErrorMessage>
            Error loading products: {error.message}
          </ErrorMessage>
        </div>
      </ProductsContainer>
    );
  }

  return (
    <ProductsContainer>
      <div className="container">
        <h1>Products</h1>
        
        <FiltersSection>
          <FilterRow>
            <FilterGroup>
              <label>Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="form-control"
              />
            </FilterGroup>
            
            <FilterGroup>
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="form-control"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
              </select>
            </FilterGroup>
            
            <FilterGroup>
              <label>Brand</label>
              <input
                type="text"
                placeholder="Brand name"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="form-control"
              />
            </FilterGroup>
            
            <FilterGroup>
              <label>Min Price</label>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="form-control"
              />
            </FilterGroup>
            
            <FilterGroup>
              <label>Max Price</label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="form-control"
              />
            </FilterGroup>
          </FilterRow>
        </FiltersSection>

        {data?.products?.length > 0 ? (
          <>
            <ProductsGrid>
              {data.products.map((product) => (
                <ProductCard key={product._id}>
                  <ProductImage>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      '📦'
                    )}
                  </ProductImage>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductPrice>${product.price}</ProductPrice>
                    <ProductRating>
                      ⭐ {product.rating || 0} ({product.reviewCount || 0} reviews)
                    </ProductRating>
                    <AddToCartBtn>
                      Add to Cart
                    </AddToCartBtn>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>

            {data.totalPages > 1 && (
              <Pagination>
                <PageButton
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  Previous
                </PageButton>
                
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                  <PageButton
                    key={page}
                    active={page === filters.page}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PageButton>
                ))}
                
                <PageButton
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === data.totalPages}
                >
                  Next
                </PageButton>
              </Pagination>
            )}
          </>
        ) : (
          <div className="text-center">
            <h3>No products found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </ProductsContainer>
  );
};

export default Products;
