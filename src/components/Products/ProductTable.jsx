// /components/ProductTable.jsx
import { Button } from '../ui/button';


export default function ProductTable({ products, onEdit, onDelete, onRestock }) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Description</th>
            <th className="p-2">Category</th>
            <th className="p-2">Supplier</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Price</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.productId} className="border-t">
              <td className="p-2">{p.productId}</td>
              <td className="p-2">{p.productName}</td>
              <td className="p-2">{p.productDesc}</td>
              <td className="p-2">{p.categoryId}</td>
              <td className="p-2">{p.supplierId}</td>
              <td className={`p-2 ${p.productQty < 20 ? 'text-red-500' : ''}`}>{p.productQty}</td>
              <td className="p-2">${p.productPrice}</td>
              <td className="p-2 space-x-2">
                <Button onClick={() => onEdit(p)} size="sm">Edit</Button>
                <Button onClick={() => onDelete(p.productId)} variant="destructive" size="sm">Delete</Button>
                {p.productQty < 20 && (
                  <Button onClick={() => onRestock(p)} variant="secondary" size="sm">Restock</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
