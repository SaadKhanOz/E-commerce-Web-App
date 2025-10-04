import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #333;
  color: white;
  padding: 2rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    margin-bottom: 1rem;
    color: #007bff;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: #ccc;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: white;
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #555;
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: center;
  color: #ccc;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <div className="container">
        <FooterContent>
          <FooterSection>
            <h3>About Us</h3>
            <p>Your trusted e-commerce platform for quality products and excellent service.</p>
          </FooterSection>
          
          <FooterSection>
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/products">Products</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/help">Help Center</a></li>
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Customer Service</h3>
            <ul>
              <li><a href="/shipping">Shipping Info</a></li>
              <li><a href="/returns">Returns</a></li>
              <li><a href="/support">Support</a></li>
              <li><a href="/faq">FAQ</a></li>
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Connect</h3>
            <ul>
              <li><a href="/newsletter">Newsletter</a></li>
              <li><a href="/social">Social Media</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </FooterSection>
        </FooterContent>
        
        <FooterBottom>
          <p>&copy; 2024 E-Commerce Platform. All rights reserved.</p>
        </FooterBottom>
      </div>
    </FooterContainer>
  );
};

export default Footer;
