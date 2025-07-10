import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/transaction.dart';

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
  static Future<Map<String, double>> getMonthlyStats() async {
    final now = DateTime.now();
    final startOfMonth = DateTime(now.year, now.month, 1);
    final endOfMonth = DateTime(now.year, now.month + 1, 0);
    
    final response = await _client
        .from('transactions')
        .select('amount, type')
        .eq('user_id', currentUser!.id)
        .gte('created_at', startOfMonth.toIso8601String())
        .lte('created_at', endOfMonth.toIso8601String());
    
    double totalIncome = 0;
    double totalExpense = 0;
    
    for (final transaction in response) {
      if (transaction['type'] == 'income') {
        totalIncome += transaction['amount'];
      } else {
        totalExpense += transaction['amount'];
      }
    }
    
    return {
      'income': totalIncome,
      'expense': totalExpense,
      'balance': totalIncome - totalExpense,
    };
  }
}