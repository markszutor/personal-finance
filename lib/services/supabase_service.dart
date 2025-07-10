import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/transaction.dart';
import '../models/user_preferences.dart';

class SupabaseService {
  static final SupabaseClient _client = Supabase.instance.client;
  
  static SupabaseClient get client => _client;
  
  // Auth methods
  static Future<AuthResponse> signUp(String email, String password) async {
    return await _client.auth.signUp(
      email: email,
      password: password,
    );
  }
  
  static Future<AuthResponse> signIn(String email, String password) async {
    return await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }
  
  static Future<void> signOut() async {
    await _client.auth.signOut();
  }
  
  static User? get currentUser => _client.auth.currentUser;
  
  static Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;
  
  // User Preferences methods
  static Future<UserPreferences> getUserPreferences() async {
    final response = await _client
        .from('user_preferences')
        .select()
        .eq('user_id', currentUser!.id)
        .single();
    
    return UserPreferences.fromJson(response);
  }
  
  static Future<UserPreferences> createUserPreferences(UserPreferences preferences) async {
    final response = await _client
        .from('user_preferences')
        .insert(preferences.toJson())
        .select()
        .single();
    
    return UserPreferences.fromJson(response);
  }
  
  static Future<UserPreferences> updateUserPreferences(UserPreferences preferences) async {
    final response = await _client
        .from('user_preferences')
        .update(preferences.toJson())
        .eq('id', preferences.id)
        .select()
        .single();
    
    return UserPreferences.fromJson(response);
  }
  
  // Transaction methods
  static Future<List<Transaction>> getTransactions() async {
    final response = await _client
        .from('transactions')
        .select()
        .eq('user_id', currentUser!.id)
        .order('created_at', ascending: false);
    
    return (response as List)
        .map((json) => Transaction.fromJson(json))
        .toList();
  }
  
  static Future<Transaction> createTransaction(Transaction transaction) async {
    final response = await _client
        .from('transactions')
        .insert(transaction.toJson())
        .select()
        .single();
    
    return Transaction.fromJson(response);
  }
  
  static Future<Transaction> updateTransaction(Transaction transaction) async {
    final response = await _client
        .from('transactions')
        .update(transaction.toJson())
        .eq('id', transaction.id)
        .select()
        .single();
    
    return Transaction.fromJson(response);
  }
  
  static Future<void> deleteTransaction(String id) async {
    await _client
        .from('transactions')
        .delete()
        .eq('id', id);
  }
  
  // Statistics methods
  static Future<Map<String, double>> getMonthlyStats([String? currency]) async {
    final now = DateTime.now();
    final startOfMonth = DateTime(now.year, now.month, 1);
    final endOfMonth = DateTime(now.year, now.month + 1, 0);
    
    var query = _client
        .from('transactions')
        .select('amount, type, currency, exchange_rate')
        .eq('user_id', currentUser!.id)
        .gte('created_at', startOfMonth.toIso8601String())
        .lte('created_at', endOfMonth.toIso8601String());
    
    final response = await query;
    
    double totalIncome = 0;
    double totalExpense = 0;
    
    for (final transaction in response) {
      double amount = transaction['amount'].toDouble();
      
      // Convert to default currency if needed
      if (currency != null && transaction['currency'] != currency) {
        final exchangeRate = transaction['exchange_rate']?.toDouble() ?? 1.0;
        amount = amount * exchangeRate;
      }
      
      if (transaction['type'] == 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    }
    
    return {
      'income': totalIncome,
      'expense': totalExpense,
      'balance': totalIncome - totalExpense,
    };
  }
  
  static Future<Map<String, double>> getCurrencyBreakdown() async {
    final response = await _client
        .from('transactions')
        .select('amount, type, currency')
        .eq('user_id', currentUser!.id);
    
    Map<String, double> breakdown = {};
    
    for (final transaction in response) {
      final currency = transaction['currency'] as String;
      final amount = transaction['amount'].toDouble();
      final isIncome = transaction['type'] == 'income';
      
      breakdown[currency] = (breakdown[currency] ?? 0) + (isIncome ? amount : -amount);
    }
    
    return breakdown;
  }
}