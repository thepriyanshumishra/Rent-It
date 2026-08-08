from abc import ABC, abstractmethod

class StorageProvider(ABC):
    @abstractmethod
    def save(self, name, content):
        pass
