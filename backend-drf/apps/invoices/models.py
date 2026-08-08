from django.db import models

class Invoice(models.Model):
    order = models.ForeignKey('rentals.RentalOrder', on_delete=models.CASCADE, related_name='invoices', null=True, blank=True)
    invoice_number = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('paid', 'Paid'), ('cancelled', 'Cancelled')], default='pending')
    pdf_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Invoice {self.invoice_number}"
