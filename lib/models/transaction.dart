class Transaction {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final double amount;
  final String category;
  final TransactionType type;
  final String currency;
  final double? exchangeRate;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Transaction({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    required this.amount,
    required this.category,
    required this.type,
    required this.currency,
    this.exchangeRate,
    required this.createdAt,
    this.updatedAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      userId: json['user_id'],
      title: json['title'],
      description: json['description'],
      amount: json['amount'].toDouble(),
      category: json['category'],
      type: TransactionType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
      ),
      currency: json['currency'] ?? 'USD',
      exchangeRate: json['exchange_rate']?.toDouble(),
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'description': description,
      'amount': amount,
      'category': category,
      'type': type.toString().split('.').last,
      'currency': currency,
      'exchange_rate': exchangeRate,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  Transaction copyWith({
    String? id,
    String? userId,
    String? title,
    String? description,
    double? amount,
    String? category,
    TransactionType? type,
    String? currency,
    double? exchangeRate,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Transaction(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      description: description ?? this.description,
      amount: amount ?? this.amount,
      category: category ?? this.category,
      type: type ?? this.type,
      currency: currency ?? this.currency,
      exchangeRate: exchangeRate ?? this.exchangeRate,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

enum TransactionType {
  income,
  expense,
}