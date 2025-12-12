# Hubly - CRM Ticket Management System

A comprehensive customer relationship management (CRM) ticket management system built with the MERN stack. Hubly enables businesses to efficiently manage customer support tickets with role-based access control, real-time messaging, and automated missed chat detection.

## 🌐 Live Demo

- **Frontend**: [https://fincal-evaluation-project.vercel.app](https://fincal-evaluation-project.vercel.app)
- **Backend API**: [https://crm-management-api-c9ax.onrender.com](https://crm-management-api-c9ax.onrender.com)

## 🔑 Admin Access (For Testing)

To explore all admin features immediately, use these credentials:

**Admin Login:**
- **Email**: `gouravsharma20a@gmail.com`
- **Password**: `Gourav@1234`

**What you can do with admin access:**
- ✅ View and manage all tickets in the system
- ✅ Assign tickets to team members
- ✅ Manage team member accounts
- ✅ Configure system settings and thresholds
- ✅ Access comprehensive analytics dashboard
- ✅ Test all administrative features

> **Note**: These credentials are provided for demonstration purposes only. Please do not modify critical settings or delete important data.

## 🚀 Features

### Core Functionality
- **Customer Ticket Submission** - Customers can submit support tickets through an integrated chat widget
- **Role-Based Access Control** - Three user roles: Admin, Team Member, and Customer
- **Real-Time Messaging** - Live chat functionality for instant communication
- **Ticket Management** - Comprehensive dashboard for viewing, filtering, and managing tickets
- **Team Assignment** - Admins can assign tickets to specific team members
- **Missed Chat Detection** - Automatically flags tickets when admin response time exceeds configurable thresholds
- **Search & Filter** - Advanced search and filtering options (All Tickets, Resolved, Unresolved)
- **Analytics Dashboard** - Track ticket metrics and team performance
- **UI Customization** - Customizable chat widget appearance

### Admin Capabilities
- View and manage all tickets across the system
- Assign tickets to team members
- Mark tickets as resolved/unresolved
- Manage team members and their permissions
- Configure missed chat threshold settings
- Access comprehensive analytics and reports

### Team Member Capabilities
- View assigned tickets only
- Respond to customer queries in real-time
- Update ticket status
- Access personal performance metrics

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Context API for state management
- Custom CSS styling
- Responsive design
- Deployed on **Vercel**

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Password hashing with pepper for enhanced security
- Deployed on **Render**

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

## 🔧 Installation

### Clone the repository
```bash
git clone https://github.com/Gouravsharma20/fincal-evaluation-project.git
cd hubly-crm
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file with the following variables
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PASSWORD_PEPPER=your_password_pepper
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file with the following variables
REACT_APP_API_BASE_URL=https://crm-management-api-c9ax.onrender.com
```

### Run the Application

**Start Backend Server:**
```bash
cd backend
npm start
```

**Start Frontend Development Server:**
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## 📱 Usage

### For Customers
1. Access the chat widget on your website
2. Submit your query or issue
3. Receive real-time responses from support team
4. Track ticket status

### For Team Members
1. Log in with your team member credentials
2. View assigned tickets in your dashboard
3. Respond to customer queries
4. Update ticket status as you progress

### For Admins
1. Log in with admin credentials
2. Access the admin dashboard
3. View all tickets and their statuses
4. Assign tickets to team members
5. Monitor team performance through analytics
6. Configure system settings and thresholds

## 🗂️ Project Structure

```
hubly-crm/
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Dashboard/
│   │   │   ├── TicketDetail/
│   │   │   ├── TeamManagement/
│   │   │   └── Analytics/
│   │   ├── Hooks/
│   │   ├── Assets/
│   │   └── config/
│   └── public/
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── config/
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with additional pepper layer
- Role-based authorization
- Secure API endpoints
- CORS configuration for production

## 🎨 Key Components

- **Dashboard** - Main ticket management interface
- **TicketDetail** - Individual ticket view with chat history
- **TeamManagement** - Team member administration
- **Analytics** - Performance metrics and reporting
- **Chat Widget** - Customer-facing support interface

## 📊 Database Schema

**Users Collection:**
- Authentication details
- Role assignment (admin/team member/customer)
- Profile information

**Tickets Collection:**
- Customer information
- Ticket status and priority
- Assignment details
- Timestamps and metadata
- Missed chat flags

**Messages Collection:**
- Ticket reference
- Message content
- Sender information
- Timestamps

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables:
   - `REACT_APP_API_BASE_URL=https://crm-management-api-c9ax.onrender.com`
3. Deploy with automatic builds on push
4. **Live URL**: [https://fincal-evaluation-project.vercel.app](https://fincal-evaluation-project.vercel.app)

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PASSWORD_PEPPER`
   - `PORT`
4. Deploy with automatic deployments
5. **Live URL**: [https://crm-management-api-c9ax.onrender.com](https://crm-management-api-c9ax.onrender.com)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Gourav Sharma**

- GitHub: [@Gouravsharma20](https://github.com/Gouravsharma20)
- Email: gouravsharma20a@gmail.com
- Project Repository: [fincal-evaluation-project](https://github.com/Gouravsharma20/fincal-evaluation-project)

## 🙏 Acknowledgments

- Built with the MERN stack
- Inspired by modern CRM solutions
- Designed for scalability and ease of use

## 📞 Support

For support, email gouravsharma20a@gmail.com or create an issue in the [GitHub repository](https://github.com/Gouravsharma20/fincal-evaluation-project/issues).

---

**Note**: This is a demonstration project. The admin credentials provided above are for testing purposes only. In a production environment, ensure all credentials are properly secured and never commit sensitive information to version control.

## 📈 Project Stats

- **Tech Stack**: JavaScript 65.0% | CSS 34.5% | HTML 0.5%
- **Platform**: Vercel (Frontend) + Render (Backend)
- **Status**: ✅ Production Ready
