from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import PickupViewSet, ReturnViewSet, ProductInspectionViewSet, DamageReportViewSet

router = SimpleRouter()
router.register(r'pickups', PickupViewSet)
router.register(r'returns', ReturnViewSet)
router.register(r'inspections', ProductInspectionViewSet)
router.register(r'damages', DamageReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
