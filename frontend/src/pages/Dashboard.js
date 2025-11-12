import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin: 0;
`;

const SearchSection = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background: #0056b3;
  }
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ServiceCard = styled.div`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  &:hover {
    border-color: #007bff;
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  ${props => props.active && `
    border-color: #007bff;
    background: #f0f7ff;
  `}
`;

const ServiceIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const ServiceTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const ServiceDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.8rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
`;

const ProductName = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
`;

const ProductPrice = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: #007bff;
  margin: 0.5rem 0;
`;

const ProductCategory = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const InventoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
  background: ${props => {
    if (props.stock === 'low') return '#ffc107';
    if (props.stock === 'out') return '#dc3545';
    return '#28a745';
  }};
  color: ${props => props.stock === 'out' ? 'white' : '#333'};
`;

const InventoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: ${props => props.align || 'left'};
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f8f9fa;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderNumber = styled.div`
  font-weight: bold;
  color: #007bff;
  font-size: 1.1rem;
`;

const OrderStatus = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  background: ${props => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      processing: '#007bff',
      shipped: '#6f42c1',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[props.status] || '#6c757d';
  }};
  color: white;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [activeService, setActiveService] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('products');
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventory: 0,
    totalOrders: 0,
    lowStockItems: 0
  });

  const services = [
    { id: 'products', name: 'Products', icon: '📦', desc: 'View all products' },
    { id: 'inventory', name: 'Inventory', icon: '📊', desc: 'Check stock levels' },
    { id: 'orders', name: 'Orders', icon: '🛒', desc: 'View order history' },
    { id: 'search', name: 'Search', icon: '🔍', desc: 'Search products & orders' },
    { id: 'analytics', name: 'Analytics', icon: '📈', desc: 'View analytics' }
  ];

  useEffect(() => {
    loadData();
  }, [activeService]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (activeService) {
        case 'products':
          const productsData = await api.products.getAll({ limit: 20 });
          setProducts(productsData.products || []);
          setStats(prev => ({ ...prev, totalProducts: productsData.total || 0 }));
          break;
          
        case 'inventory':
          const inventoryData = await api.inventory.getAll({ limit: 50 });
          setInventory(inventoryData.inventory || []);
          setStats(prev => ({ 
            ...prev, 
            totalInventory: inventoryData.total || 0,
            lowStockItems: inventoryData.inventory?.filter(i => i.availableQuantity <= i.reorderLevel).length || 0
          }));
          break;
          
        case 'orders':
          if (user) {
            const ordersData = await api.orders.getByCustomer(user.userId || user.id, { limit: 20 });
            setOrders(ordersData.orders || []);
            setStats(prev => ({ ...prev, totalOrders: ordersData.total || 0 }));
          } else {
            setOrders([]);
          }
          break;
          
        case 'analytics':
          const analyticsData = await api.analytics.dashboard('7d');
          setStats({
            totalProducts: analyticsData.totalProducts || 0,
            totalOrders: analyticsData.totalOrders || 0,
            totalInventory: 0,
            lowStockItems: 0
          });
          break;
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.warning('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setActiveService('search');

    try {
      if (searchType === 'products') {
        const results = await api.search.products(searchQuery, { limit: 20 });
        setSearchResults(results);
        setProducts(results.results || []);
      } else if (searchType === 'orders' && user) {
        const results = await api.orders.getByCustomer(user.userId || user.id, { limit: 20 });
        const filtered = results.orders?.filter(order => 
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
        ) || [];
        setOrders(filtered);
        setSearchResults({ orders: filtered, total: filtered.length });
      }
    } catch (err) {
      setError(err.message || 'Search failed');
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading && !searchResults) {
      return <LoadingSpinner>Loading...</LoadingSpinner>;
    }

    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }

    switch (activeService) {
      case 'products':
        return (
          <ContentSection>
            <SectionTitle>Products ({products.length})</SectionTitle>
            {products.length === 0 ? (
              <EmptyState>No products found. Please seed the database first.</EmptyState>
            ) : (
              <ProductsGrid>
                {products.map(product => (
                  <ProductCard key={product._id}>
                    <ProductName>{product.name}</ProductName>
                    <ProductCategory>{product.category} • {product.brand}</ProductCategory>
                    <ProductPrice>${product.price}</ProductPrice>
                    <div style={{ marginTop: '0.5rem' }}>
                      <InventoryBadge stock="in">In Stock</InventoryBadge>
                    </div>
                  </ProductCard>
                ))}
              </ProductsGrid>
            )}
          </ContentSection>
        );

      case 'inventory':
        return (
          <ContentSection>
            <SectionTitle>Inventory Management ({inventory.length} items)</SectionTitle>
            {inventory.length === 0 ? (
              <EmptyState>No inventory data found. Please seed the database first.</EmptyState>
            ) : (
              <InventoryTable>
                <TableHeader>
                  <TableRow>
                    <TableCell as="th">Product ID</TableCell>
                    <TableCell as="th" align="center">Quantity</TableCell>
                    <TableCell as="th" align="center">Available</TableCell>
                    <TableCell as="th" align="center">Reserved</TableCell>
                    <TableCell as="th" align="center">Status</TableCell>
                    <TableCell as="th">Location</TableCell>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {inventory.map(item => {
                    const stockStatus = item.availableQuantity === 0 ? 'out' : 
                                      item.availableQuantity <= item.reorderLevel ? 'low' : 'in';
                    return (
                      <TableRow key={item._id}>
                        <TableCell>{item.productId}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="center"><strong>{item.availableQuantity}</strong></TableCell>
                        <TableCell align="center">{item.reservedQuantity}</TableCell>
                        <TableCell align="center">
                          <InventoryBadge stock={stockStatus}>
                            {stockStatus === 'out' ? 'Out of Stock' : 
                             stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                          </InventoryBadge>
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </InventoryTable>
            )}
          </ContentSection>
        );

      case 'orders':
        return (
          <ContentSection>
            <SectionTitle>Orders ({orders.length})</SectionTitle>
            {!user ? (
              <EmptyState>Please login to view your orders</EmptyState>
            ) : orders.length === 0 ? (
              <EmptyState>No orders found</EmptyState>
            ) : (
              <OrdersList>
                {orders.map(order => (
                  <OrderCard key={order._id}>
                    <OrderHeader>
                      <OrderNumber>{order.orderNumber}</OrderNumber>
                      <OrderStatus status={order.status}>{order.status}</OrderStatus>
                    </OrderHeader>
                    <div>
                      <strong>Total: ${order.total.toFixed(2)}</strong>
                      <div style={{ marginTop: '0.5rem', color: '#666' }}>
                        {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </OrderCard>
                ))}
              </OrdersList>
            )}
          </ContentSection>
        );

      case 'search':
        return (
          <ContentSection>
            <SectionTitle>Search Results</SectionTitle>
            {searchResults && searchType === 'products' && (
              <div>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Found {searchResults.total} result(s) for "{searchQuery}"
                </p>
                <ProductsGrid>
                  {products.map(product => (
                    <ProductCard key={product._id}>
                      <ProductName>{product.name}</ProductName>
                      <ProductCategory>{product.category} • {product.brand}</ProductCategory>
                      <ProductPrice>${product.price}</ProductPrice>
                    </ProductCard>
                  ))}
                </ProductsGrid>
              </div>
            )}
            {searchResults && searchType === 'orders' && (
              <OrdersList>
                {orders.map(order => (
                  <OrderCard key={order._id}>
                    <OrderHeader>
                      <OrderNumber>{order.orderNumber}</OrderNumber>
                      <OrderStatus status={order.status}>{order.status}</OrderStatus>
                    </OrderHeader>
                    <div>
                      <strong>Total: ${order.total.toFixed(2)}</strong>
                    </div>
                  </OrderCard>
                ))}
              </OrdersList>
            )}
          </ContentSection>
        );

      case 'analytics':
        return (
          <ContentSection>
            <SectionTitle>Analytics Dashboard</SectionTitle>
            <StatsGrid>
              <StatCard>
                <StatValue>{stats.totalProducts}</StatValue>
                <StatLabel>Total Products</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.totalOrders}</StatValue>
                <StatLabel>Total Orders</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.totalInventory}</StatValue>
                <StatLabel>Inventory Items</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.lowStockItems}</StatValue>
                <StatLabel>Low Stock Items</StatLabel>
              </StatCard>
            </StatsGrid>
          </ContentSection>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>E-Commerce Dashboard</Title>
        {user && <div style={{ color: '#666' }}>Welcome, {user.firstName}!</div>}
      </DashboardHeader>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.totalProducts}</StatValue>
          <StatLabel>Products</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalInventory}</StatValue>
          <StatLabel>Inventory Items</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalOrders}</StatValue>
          <StatLabel>Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.lowStockItems}</StatValue>
          <StatLabel>Low Stock Alerts</StatLabel>
        </StatCard>
      </StatsGrid>

      <SearchSection>
        <SearchBox>
          <SearchInput
            type="text"
            placeholder={`Search ${searchType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            <option value="products">Products</option>
            <option value="orders">Orders</option>
          </select>
          <SearchButton onClick={handleSearch}>Search</SearchButton>
        </SearchBox>
      </SearchSection>

      <ServiceGrid>
        {services.map(service => (
          <ServiceCard
            key={service.id}
            active={activeService === service.id}
            onClick={() => {
              setActiveService(service.id);
              setSearchResults(null);
            }}
          >
            <ServiceIcon>{service.icon}</ServiceIcon>
            <ServiceTitle>{service.name}</ServiceTitle>
            <ServiceDescription>{service.desc}</ServiceDescription>
          </ServiceCard>
        ))}
      </ServiceGrid>

      {renderContent()}
    </DashboardContainer>
  );
};

export default Dashboard;

