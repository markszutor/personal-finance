import 'package:flutter/material.dart';
import '../models/currency.dart';
import '../models/user_preferences.dart';
import '../services/supabase_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  UserPreferences? _preferences;
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    setState(() => _isLoading = true);
    
    try {
      final preferences = await SupabaseService.getUserPreferences();
      setState(() {
        _preferences = preferences;
        _isLoading = false;
      });
    } catch (error) {
      // If preferences don't exist, create default ones
      try {
        final newPreferences = UserPreferences(
          id: '',
          userId: SupabaseService.currentUser!.id,
          defaultCurrency: 'USD',
          createdAt: DateTime.now(),
        );
        
        final created = await SupabaseService.createUserPreferences(newPreferences);
        setState(() {
          _preferences = created;
          _isLoading = false;
        });
      } catch (createError) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error loading preferences: $createError'),
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
        }
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _updateDefaultCurrency(String currencyCode) async {
    if (_preferences == null) return;

    setState(() => _isSaving = true);

    try {
      final updatedPreferences = _preferences!.copyWith(
        defaultCurrency: currencyCode,
        updatedAt: DateTime.now(),
      );

      final saved = await SupabaseService.updateUserPreferences(updatedPreferences);
      
      setState(() {
        _preferences = saved;
        _isSaving = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Default currency updated to $currencyCode'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error updating currency: $error'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                // Currency Settings Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.currency_exchange,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Currency Settings',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        // Default Currency
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Default Currency'),
                          subtitle: Text(
                            _preferences != null
                                ? '${CurrencyData.getCurrency(_preferences!.defaultCurrency).name} (${CurrencyData.getCurrency(_preferences!.defaultCurrency).symbol})'
                                : 'Loading...',
                          ),
                          trailing: _isSaving
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.arrow_forward_ios, size: 16),
                          onTap: _isSaving ? null : _showCurrencyPicker,
                        ),
                        
                        const Divider(),
                        
                        // Currency Info
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'About Currency Settings',
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Your default currency is used for statistics and summaries. You can still add transactions in any supported currency.',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Account Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.account_circle,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Account',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Email'),
                          subtitle: Text(SupabaseService.currentUser?.email ?? 'Not available'),
                          leading: const Icon(Icons.email_outlined),
                        ),
                        
                        const Divider(),
                        
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Sign Out'),
                          leading: Icon(Icons.logout, color: Theme.of(context).colorScheme.error),
                          textColor: Theme.of(context).colorScheme.error,
                          onTap: _signOut,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  void _showCurrencyPicker() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Text(
                    'Select Default Currency',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.builder(
                controller: scrollController,
                itemCount: CurrencyData.supportedCurrencies.length,
                itemBuilder: (context, index) {
                  final currency = CurrencyData.supportedCurrencies[index];
                  final isSelected = _preferences?.defaultCurrency == currency.code;
                  
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isSelected
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.surfaceVariant,
                      child: Text(
                        currency.symbol,
                        style: TextStyle(
                          color: isSelected
                              ? Theme.of(context).colorScheme.onPrimary
                              : Theme.of(context).colorScheme.onSurfaceVariant,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(currency.name),
                    subtitle: Text('${currency.code} • ${currency.symbol}'),
                    trailing: isSelected
                        ? Icon(
                            Icons.check_circle,
                            color: Theme.of(context).colorScheme.primary,
                          )
                        : null,
                    onTap: () {
                      Navigator.pop(context);
                      _updateDefaultCurrency(currency.code);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _signOut() async {
    try {
      await SupabaseService.signOut();
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/auth');
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error signing out: $error'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }
}