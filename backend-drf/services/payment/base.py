from abc import ABC, abstractmethod

class PaymentProvider(ABC):
    @abstractmethod
    def process_payment(self, amount, currency, source):
        pass
