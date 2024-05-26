import { render, screen } from '@testing-library/react';
import App from './App';


describe('Authentication Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login form', () => {
    cy.get('.auth-login-page').should('exist');
  });

  it('should log in with valid credentials and redirect to activities page', () => {
    cy.get('.auth-form-input[type="email"]').type('baba@gmail.com');
    cy.get('.auth-form-input[type="password"]').type('babababa');
    cy.get('.auth-button-login').click();

    cy.location('pathname').should('eq', '/travel-application');
  });

  it('should display error message with invalid credentials', () => {
    cy.get('.auth-form-input[type="email"]').type('invalid@example.com');
    cy.get('.auth-form-input[type="password"]').type('invalidpassword');
    cy.get('.auth-button-login').click();

    cy.get('.auth-error-message').should('be.visible');
  });

  it('should navigate to sign-up page when sign up button is clicked', () => {
    cy.get('.auth-button-signup').click();

    cy.location('pathname').should('eq', '/sign-up');
  });
});
