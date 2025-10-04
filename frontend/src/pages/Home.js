import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: #28a745;
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #218838;
  }
`;

const FeaturesSection = styled.section`
  padding: 4rem 0;
  background: white;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  
  h3 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    color: #666;
    line-height: 1.6;
  }
`;

const StatsSection = styled.section`
  background: #f8f9fa;
  padding: 4rem 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
`;

const StatItem = styled.div`
  h3 {
    font-size: 2.5rem;
    color: #007bff;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    font-weight: 500;
  }
`;

const Home = () => {
  return (
    <>
      <HeroSection>
        <div className="container">
          <HeroTitle>Welcome to E-Commerce Platform</HeroTitle>
          <HeroSubtitle>
            Discover amazing products with fast delivery and excellent customer service
          </HeroSubtitle>
          <CTAButton to="/products">Shop Now</CTAButton>
        </div>
      </HeroSection>

      <FeaturesSection>
        <div className="container">
          <h2 className="text-center mb-5">Why Choose Us?</h2>
          <FeaturesGrid>
            <FeatureCard>
              <h3>🚚 Fast Delivery</h3>
              <p>Get your orders delivered quickly with our reliable shipping partners.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>💳 Secure Payment</h3>
              <p>Your payments are protected with industry-standard security measures.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>🛡️ Quality Guarantee</h3>
              <p>We ensure all products meet high quality standards before shipping.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>📞 24/7 Support</h3>
              <p>Our customer support team is always ready to help you.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>🔄 Easy Returns</h3>
              <p>Not satisfied? Return your order within 30 days for a full refund.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>⭐ Customer Reviews</h3>
              <p>Read genuine reviews from our satisfied customers.</p>
            </FeatureCard>
          </FeaturesGrid>
        </div>
      </FeaturesSection>

      <StatsSection>
        <div className="container">
          <h2 className="text-center mb-5">Our Impact</h2>
          <StatsGrid>
            <StatItem>
              <h3>10K+</h3>
              <p>Happy Customers</p>
            </StatItem>
            <StatItem>
              <h3>50K+</h3>
              <p>Products Sold</p>
            </StatItem>
            <StatItem>
              <h3>99%</h3>
              <p>Customer Satisfaction</p>
            </StatItem>
            <StatItem>
              <h3>24/7</h3>
              <p>Customer Support</p>
            </StatItem>
          </StatsGrid>
        </div>
      </StatsSection>
    </>
  );
};

export default Home;
