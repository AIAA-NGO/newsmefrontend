export default function BusinessProfile() {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Business Profile</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Business Name" className="w-full p-2 border rounded" />
          <input type="text" placeholder="Email" className="w-full p-2 border rounded" />
          <input type="text" placeholder="Phone" className="w-full p-2 border rounded" />
          <input type="file" className="w-full p-2 border rounded" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        </form>
      </div>
    );
  }
  