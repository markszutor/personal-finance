# personal-finance

A comprehensive personal finance tracking application built with Flutter and Supabase. Track your income, expenses, and monitor your financial health across web and mobile platforms.

## Features

- 📱 **Cross-platform**: Works on iOS, Android, and Web
- 🔐 **Secure Authentication**: Email/password authentication with Supabase
- 💰 **Transaction Management**: Add, view, and categorize income and expenses
- 📊 **Financial Overview**: Monthly statistics and balance tracking
- 🎨 **Modern UI**: Clean, intuitive interface with Material Design 3
- 🌙 **Dark Mode**: Automatic light/dark theme support
- 📱 **Responsive Design**: Optimized for all screen sizes

## Tech Stack

- **Frontend**: Flutter (Dart)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Built-in Flutter state management
- **Charts**: FL Chart for data visualization
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Flutter SDK (3.10.0 or higher)
- Dart SDK (3.0.0 or higher)
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd personal-finance
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Supabase**
   - Create a new project in [Supabase](https://supabase.com)
   - Copy your project URL and anon key
   - Update the `.env` file with your Supabase credentials:
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Set up the database**
   - Run the migration file in your Supabase SQL editor
   - The migration will create the necessary tables and security policies

5. **Run the application**
   ```bash
   # For web
   flutter run -d chrome
   
   # For mobile (with device/emulator connected)
   flutter run
   ```

## Database Schema

### Transactions Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `title`: Text (Transaction title)
- `description`: Text (Optional description)
- `amount`: Decimal (Transaction amount)
- `category`: Text (Transaction category)
- `type`: Text (income/expense)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── transaction.dart
│   └── category.dart
├── screens/                  # UI screens
│   ├── splash_screen.dart
│   ├── auth_screen.dart
│   ├── home_screen.dart
│   └── add_transaction_screen.dart
├── services/                 # Business logic
│   └── supabase_service.dart
├── widgets/                  # Reusable UI components
│   ├── transaction_card.dart
│   └── stats_card.dart
└── utils/                    # Utilities
    └── theme.dart
```

## Features in Detail

### Authentication
- Email/password registration and login
- Secure session management with Supabase Auth
- Automatic session persistence

### Transaction Management
- Add income and expense transactions
- Categorize transactions (Food, Transportation, Salary, etc.)
- View transaction history with details
- Real-time updates across devices

### Financial Overview
- Monthly income, expense, and balance summary
- Visual statistics cards
- Transaction categorization

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Secure API communication with Supabase

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
