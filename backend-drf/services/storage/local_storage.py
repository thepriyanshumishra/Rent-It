from .base import StorageProvider
import os
from django.conf import settings

class LocalStorageProvider(StorageProvider):
    def save(self, name, content):
        path = os.path.join(settings.MEDIA_ROOT, name)
        with open(path, 'wb') as f:
            f.write(content.read() if hasattr(content, 'read') else content)
        return name
