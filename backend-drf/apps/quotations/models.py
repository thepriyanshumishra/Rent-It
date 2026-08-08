from django.db import models

class Quotation(models.Model):
    customer = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='quotations')
    created_at = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField()
    status = models.CharField(max_length=50, choices=[('draft', 'Draft'), ('sent', 'Sent'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='draft')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True)

class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

class BusinessOrder(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        CONTACTED = 'CONTACTED', 'Contacted'
        CONVERTED = 'CONVERTED', 'Converted'
        REJECTED = 'REJECTED', 'Rejected'

    company_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    equipment_needed = models.TextField()
    duration = models.CharField(max_length=100, blank=True, default='1 week')
    start_date = models.DateField(null=True, blank=True)
    estimated_budget = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} ({self.contact_name}) - {self.status}"
