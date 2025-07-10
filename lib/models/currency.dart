class Currency {
  final String code;
  final String name;
  final String symbol;
  final int decimalPlaces;

  const Currency({
    required this.code,
    required this.name,
    required this.symbol,
    this.decimalPlaces = 2,
  });

  factory Currency.fromJson(Map<String, dynamic> json) {
    return Currency(
      code: json['code'],
      name: json['name'],
      symbol: json['symbol'],
      decimalPlaces: json['decimal_places'] ?? 2,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'name': name,
      'symbol': symbol,
      'decimal_places': decimalPlaces,
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Currency && runtimeType == other.runtimeType && code == other.code;

  @override
  int get hashCode => code.hashCode;

  @override
  String toString() => '$code ($symbol)';
}

class CurrencyData {
  static const List<Currency> supportedCurrencies = [
    Currency(code: 'USD', name: 'US Dollar', symbol: '\$'),
    Currency(code: 'EUR', name: 'Euro', symbol: '€'),
    Currency(code: 'GBP', name: 'British Pound', symbol: '£'),
    Currency(code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0),
    Currency(code: 'CAD', name: 'Canadian Dollar', symbol: 'C\$'),
    Currency(code: 'AUD', name: 'Australian Dollar', symbol: 'A\$'),
    Currency(code: 'CHF', name: 'Swiss Franc', symbol: 'CHF'),
    Currency(code: 'CNY', name: 'Chinese Yuan', symbol: '¥'),
    Currency(code: 'INR', name: 'Indian Rupee', symbol: '₹'),
    Currency(code: 'KRW', name: 'South Korean Won', symbol: '₩', decimalPlaces: 0),
    Currency(code: 'SGD', name: 'Singapore Dollar', symbol: 'S\$'),
    Currency(code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK\$'),
    Currency(code: 'NOK', name: 'Norwegian Krone', symbol: 'kr'),
    Currency(code: 'SEK', name: 'Swedish Krona', symbol: 'kr'),
    Currency(code: 'DKK', name: 'Danish Krone', symbol: 'kr'),
    Currency(code: 'PLN', name: 'Polish Zloty', symbol: 'zł'),
    Currency(code: 'CZK', name: 'Czech Koruna', symbol: 'Kč'),
    Currency(code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimalPlaces: 0),
    Currency(code: 'RUB', name: 'Russian Ruble', symbol: '₽'),
    Currency(code: 'BRL', name: 'Brazilian Real', symbol: 'R\$'),
    Currency(code: 'MXN', name: 'Mexican Peso', symbol: 'MX\$'),
    Currency(code: 'ZAR', name: 'South African Rand', symbol: 'R'),
    Currency(code: 'TRY', name: 'Turkish Lira', symbol: '₺'),
    Currency(code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ\$'),
    Currency(code: 'THB', name: 'Thai Baht', symbol: '฿'),
    Currency(code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM'),
    Currency(code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimalPlaces: 0),
    Currency(code: 'PHP', name: 'Philippine Peso', symbol: '₱'),
    Currency(code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimalPlaces: 0),
  ];

  static Currency getCurrency(String code) {
    return supportedCurrencies.firstWhere(
      (currency) => currency.code == code,
      orElse: () => supportedCurrencies.first, // Default to USD
    );
  }

  static List<Currency> get popularCurrencies => [
    getCurrency('USD'),
    getCurrency('EUR'),
    getCurrency('GBP'),
    getCurrency('JPY'),
    getCurrency('CAD'),
    getCurrency('AUD'),
    getCurrency('CHF'),
    getCurrency('CNY'),
  ];
}