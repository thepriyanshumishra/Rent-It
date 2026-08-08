from .base import PaymentProvider

class TestPaymentProvider(PaymentProvider):
    def process_payment(self, amount, currency, source):
        return {"status": "success", "transaction_id": "test_txn_123"}
