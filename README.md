# GrocerDesk - Grocery Store Management System

A comprehensive grocery store management application built with React and Node.js, featuring inventory management, point of sale, staff management, and analytics.

## Features

### 🏪 Core Features and Idea
- **Dashboard**: Real-time overview with key metrics and analytics
- **Inventory Management**: Complete CRUD operations for products and categories
- **Point of Sale (POS)**: Modern checkout system with cart functionality
- **Staff Management**: Role-based access control (Admin, Manager, Cashier)
- **Customer Management**: Customer database with contact information
- **Sales History**: Complete transaction tracking and reporting
- **Analytics & Reports**: Comprehensive business insights

### 🔐 Security Features
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Protected routes and API endpoints

### 📱 User Experience
- Responsive design for all devices
- Modern Material-UI interface
- Real-time updates and notifications
- Intuitive navigation and workflows

## Tech Stack

### Frontend
- React 19
- Material-UI (MUI) v7
- React Router v7
- Axios for API calls
- Context API for state management

### Backend
- Node.js
- Express.js
- MySQL database
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

## Database Schema

The application uses the following MySQL tables:
- `staff` - Staff members with roles
- `users` - Customer information
- `categories` - Product categories
- `products` - Inventory items
- `sales` - Transaction records
- `sale_items` - Individual sale line items

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your database configuration:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=grocery
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Set up your MySQL database using the provided schema:
   ```sql
   CREATE DATABASE grocery;
   USE grocery;
   
   -- Run the SQL commands from the project description
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Getting Started
1. Access the application at `http://localhost:3000`
2. Create a staff account or use existing credentials
3. Log in with your staff credentials
4. Start managing your grocery store operations

### User Roles
- **Admin**: Full access to all features
- **Manager**: Access to most features except staff management
- **Cashier**: Limited to POS and basic inventory viewing

### Key Workflows
1. **Adding Products**: Navigate to Products → Add Product
2. **Processing Sales**: Use the POS system for checkout
3. **Managing Staff**: Admin/Manager can add/edit staff members
4. **Viewing Reports**: Access analytics in the Reports section

## API Endpoints

### Authentication
- `POST /api/auth/login` - Staff login
- `POST /api/auth/signup` - Staff registration
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Sales
- `GET /api/sales` - Get sales history
- `POST /api/sales` - Create new sale
- `GET /api/sales/:id` - Get sale details
- `DELETE /api/sales/:id` - Refund sale

### Staff Management
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Customer Management
- `GET /api/users` - Get all customers
- `POST /api/users` - Create customer
- `PUT /api/users/:id` - Update customer
- `DELETE /api/users/:id` - Delete customer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
