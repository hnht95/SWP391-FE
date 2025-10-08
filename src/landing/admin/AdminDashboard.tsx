import { useAuth } from "../../hooks/useAuth";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Welcome, {user?.name}!
            </h2>
            <p className="text-blue-700">Role: {user?.role}</p>
            <p className="text-blue-700">Email: {user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">1,234</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Active Bookings</h3>
              <p className="text-3xl font-bold">567</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Revenue</h3>
              <p className="text-3xl font-bold">$89,012</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Admin Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition duration-200">
                Manage Users
              </button>
              <button className="bg-emerald-600 text-white p-4 rounded-lg hover:bg-emerald-700 transition duration-200">
                System Settings
              </button>
              <button className="bg-amber-600 text-white p-4 rounded-lg hover:bg-amber-700 transition duration-200">
                View Reports
              </button>
              <button className="bg-rose-600 text-white p-4 rounded-lg hover:bg-rose-700 transition duration-200">
                Backup Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
