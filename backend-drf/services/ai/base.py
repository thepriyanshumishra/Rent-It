from abc import ABC, abstractmethod

class AIProvider(ABC):
    @abstractmethod
    def generate_insights(self, data):
        pass
