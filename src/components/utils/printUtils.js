export const printReceipt = async (receipt, paymentMethod, cashierName) => {
  const printWindow = window.open('', '_blank');
  
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const receiptNumber = receipt.receiptNumber || receipt.id || `TEMP-${Date.now().toString().slice(-6)}`;
  const formattedPaymentMethod = paymentMethod ? paymentMethod.replace('_', ' ') : (receipt.paymentMethod || 'CASH');

  // Process items with better name fallback
  const items = (receipt.items || []).map(item => ({
    id: item.id,
    name: item.name || item.productName || (item.sku ? `SKU: ${item.sku}` : `Item ${item.id}`),
    quantity: item.quantity || 1,
    price: item.price || 0,
    discountAmount: item.discountAmount || item.discount || 0,
    discountPercentage: item.discountPercentage || 0,
    isSoldOut: item.isSoldOut || false
  }));

  // Calculate totals
  const subtotal = receipt.subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = receipt.discount || items.reduce((sum, item) => sum + (item.discountAmount * item.quantity), 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = receipt.tax || taxableAmount * 0.16;
  const total = receipt.total || taxableAmount + tax;

  const receiptContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            width: 80mm;
            margin: 0;
            padding: 0;
          }
        }
        .sold-out {
          color: #ef4444;
          text-decoration: line-through;
        }
        .item-row {
          display: grid;
          grid-template-columns: 50% 15% 15% 20%;
          gap: 2px;
        }
      </style>
    </head>
    <body class="font-sans p-4 w-full max-w-[80mm] mx-auto">
      <!-- Header -->
      <div class="text-center mb-4">
        <div class="text-xl font-bold tracking-tight">INVENTORY STORE</div>
        <div class="text-xs text-gray-600">123 Business Street, Nairobi</div>
        <div class="text-xs text-gray-600">Tel: +254 700 000000</div>
      </div>

      <!-- Receipt Info -->
      <div class="flex justify-between text-xs mb-4 border-b pb-2">
        <div>
          <div class="font-semibold">Date:</div>
          <div>${formattedDate}</div>
          ${cashierName ? `<div class="font-semibold mt-1">Cashier:</div><div>${cashierName}</div>` : ''}
        </div>
        <div class="text-right">
          <div class="font-semibold">Receipt #:</div>
          <div>${receiptNumber}</div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="mb-2">
        <div class="item-row text-xs font-semibold border-b pb-1 mb-1">
          <div>ITEM</div>
          <div class="text-right">QTY</div>
          <div class="text-right">PRICE</div>
          <div class="text-right">TOTAL</div>
        </div>
        
        ${items.map(item => {
          const itemPrice = item.price;
          const itemTotal = itemPrice * item.quantity;
          const soldOutClass = item.isSoldOut ? 'sold-out' : '';
          
          return `
          <div class="item-row text-xs border-b border-dashed py-1 ${soldOutClass}">
            <div class="truncate">
              ${item.name}
              ${item.isSoldOut ? ' (SOLD OUT)' : ''}
            </div>
            <div class="text-right">${item.quantity}</div>
            <div class="text-right">${itemPrice.toFixed(2)}</div>
            <div class="text-right font-medium">${itemTotal.toFixed(2)}</div>
          </div>
          `;
        }).join('')}
      </div>

      <!-- Totals -->
      <div class="text-sm mt-4 space-y-1">
        <div class="flex justify-between">
          <span>Subtotal:</span>
          <span class="font-medium">Ksh ${subtotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between">
          <span>Tax (16%):</span>
          <span class="font-medium">Ksh ${tax.toFixed(2)}</span>
        </div>
        <div class="flex justify-between border-t pt-1 font-bold text-base">
          <span>TOTAL:</span>
          <span>Ksh ${total.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-xs mt-2">
          <span class="font-semibold">Payment Method:</span>
          <span class="uppercase">${formattedPaymentMethod}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center text-xs mt-6 pt-2 border-t border-dashed">
        ${receipt.customerName ? `<div class="mb-1">Customer: ${receipt.customerName}</div>` : ''}
        <div class="font-semibold">Thank you for your business!</div>
        <div class="text-gray-600 mt-1">* Items cannot be returned/exchanged *</div>
        ${items.some(item => item.isSoldOut) ? 
          `<div class="text-red-500 mt-1">* Some items were sold out but included in calculations *</div>` : ''}
        <div class="text-[10px] mt-2">
          <div>Powered by Inventory Management System</div>
          <div>${now.getFullYear()} © All Rights Reserved</div>
        </div>
      </div>

      <script>
        setTimeout(() => {
          window.print();
          window.close();
        }, 300);
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(receiptContent);
  printWindow.document.close();
};