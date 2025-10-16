import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, Home, LogOut, Plus, X, Check, AlertCircle, TrendingUp, LogIn, UserPlus } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API Service Layer
const api = {
  // Helper to get auth token
  getToken: () => localStorage.getItem('chorecast_token'),
  
  // Helper to set auth headers
  getHeaders: () => ({
    'Content-Type': 'application/json',
    ...(api.getToken() ? { 'Authorization': `Bearer ${api.getToken()}` } : {})
  }),

  // Auth endpoints
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },
    
    register: async (name, email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    }
  },

  // Chore endpoints
  chores: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/chores`, {
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch chores');
      return response.json();
    },
    
    create: async (choreData) => {
      const response = await fetch(`${API_BASE_URL}/chores`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(choreData)
      });
      if (!response.ok) throw new Error('Failed to create chore');
      return response.json();
    },
    
    complete: async (choreId) => {
      const response = await fetch(`${API_BASE_URL}/chores/${choreId}/complete`, {
        method: 'PUT',
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to complete chore');
      return response.json();
    }
  },

  // Expense endpoints
  expenses: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch expenses');
      return response.json();
    },
    
    create: async (expenseData) => {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(expenseData)
      });
      if (!response.ok) throw new Error('Failed to create expense');
      return response.json();
    },
    
    settle: async (expenseId) => {
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/settle`, {
        method: 'PUT',
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to settle expense');
      return response.ok;
    }
  },

  // Balance endpoints
  balances: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/balances`, {
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch balances');
      return response.json();
    },
    
    getMyDebts: async () => {
      const response = await fetch(`${API_BASE_URL}/balances/my-debts`, {
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch debts');
      return response.json();
    }
  },

  // Users endpoint (for household members)
  users: {
    getHousehold: async () => {
      const response = await fetch(`${API_BASE_URL}/users/household`, {
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch household');
      return response.json();
    }
  }
};

function ChoreCastApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [chores, setChores] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddChore, setShowAddChore] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('chorecast_token');
    const user = localStorage.getItem('chorecast_user');
    
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
      loadAllData();
    }
  }, []);

  // Load all data from backend
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [choresData, expensesData, balancesData, usersData] = await Promise.all([
        api.chores.getAll(),
        api.expenses.getAll(),
        api.balances.getAll(),
        api.users.getHousehold().catch(() => []) // Fallback if endpoint doesn't exist
      ]);
      
      setChores(choresData);
      setExpenses(expensesData);
      setBalances(balancesData);
      if (usersData.length > 0) setUsers(usersData);
      
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (email, password) => {
    try {
      const data = await api.auth.login(email, password);
      localStorage.setItem('chorecast_token', data.token);
      localStorage.setItem('chorecast_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      showNotification('Welcome back! 👋');
      await loadAllData();
    } catch (err) {
      showError('Invalid email or password');
    }
  };

  // Handle register
  const handleRegister = async (name, email, password) => {
    try {
      const data = await api.auth.register(name, email, password);
      localStorage.setItem('chorecast_token', data.token);
      localStorage.setItem('chorecast_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      showNotification('Account created successfully! 🎉');
      await loadAllData();
    } catch (err) {
      showError('Registration failed. Email may already be in use.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('chorecast_token');
    localStorage.removeItem('chorecast_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setChores([]);
    setExpenses([]);
    setBalances([]);
    setUsers([]);
  };

  // Complete chore
  const completeChore = async (choreId) => {
    try {
      const updatedChore = await api.chores.complete(choreId);
      setChores(chores.map(c => c.id === choreId ? updatedChore : c));
      showNotification('Chore completed! Great job! 🎉');
    } catch (err) {
      showError(err.message);
    }
  };

  // Add new chore
  const addChore = async (choreData) => {
    try {
      const newChore = await api.chores.create(choreData);
      setChores([...chores, newChore]);
      setShowAddChore(false);
      showNotification('Chore added successfully! 📋');
    } catch (err) {
      showError(err.message);
    }
  };

  // Add new expense
  const addExpense = async (expenseData) => {
    try {
      const newExpense = await api.expenses.create(expenseData);
      setExpenses([...expenses, newExpense]);
      setShowAddExpense(false);
      showNotification('Expense added successfully! 💰');
      await loadAllData(); // Reload to get updated balances
    } catch (err) {
      showError(err.message);
    }
  };

  // Settle debt
  const settleDebt = async (expenseId) => {
    try {
      await api.expenses.settle(expenseId);
      await loadAllData(); // Reload all data
      showNotification('Payment settled! 💰');
    } catch (err) {
      showError(err.message);
    }
  };

  // Calculate balances from data
  const calculateBalances = () => {
    const balanceMap = {};
    
    balances.forEach(balance => {
      const key = `${balance.userFrom}-${balance.userTo}`;
      balanceMap[key] = balance.amount;
    });

    return balanceMap;
  };

  const balanceMap = calculateBalances();

  // Get user's balance
  const getUserBalance = (userId) => {
    let owes = 0;
    let owed = 0;

    balances.forEach(balance => {
      if (balance.userFrom === userId) owes += balance.amount;
      if (balance.userTo === userId) owed += balance.amount;
    });

    return { owes, owed, net: owed - owes };
  };

  // Show notification
  const showNotification = (message) => {
    const id = Date.now();
    setNotifications([...notifications, { id, message, type: 'success' }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Show error
  const showError = (message) => {
    const id = Date.now();
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Show login/register page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
              <Home className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ChoreCast</h1>
              <p className="text-xs text-gray-500">Smart Household Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'chores', label: 'Chores', icon: Calendar },
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
              { id: 'household', label: 'Household', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div key={notif.id} className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg flex items-center gap-2 animate-slide-in">
            <Check className="text-green-600" size={18} />
            <span className="text-sm text-green-800">{notif.message}</span>
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard 
          currentUser={currentUser}
          users={users}
          chores={chores}
          expenses={expenses}
          getUserBalance={getUserBalance}
          completeChore={completeChore}
        />}
        
        {activeTab === 'chores' && <ChoresView 
          chores={chores}
          users={users}
          currentUser={currentUser}
          completeChore={completeChore}
          showAddChore={showAddChore}
          setShowAddChore={setShowAddChore}
          addChore={addChore}
        />}
        
        {activeTab === 'expenses' && <ExpensesView 
          expenses={expenses}
          users={users}
          currentUser={currentUser}
          balances={balances}
          showAddExpense={showAddExpense}
          setShowAddExpense={setShowAddExpense}
          addExpense={addExpense}
          settleDebt={settleDebt}
        />}
        
        {activeTab === 'household' && <HouseholdView 
          users={users}
          chores={chores}
          expenses={expenses}
          currentUser={currentUser}
        />}
      </main>
    </div>
  );
}

// Auth Page Component
function AuthPage({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister(formData.name, formData.email, formData.password);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl mb-4">
            <Home className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ChoreCast</h1>
          <p className="text-gray-600">Smart Household Task & Expense Manager</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                {isLogin ? 'Login' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo: Use any email/password to register</p>
          <p className="text-xs mt-1">Backend must be running on localhost:8080</p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ currentUser, users, chores, expenses, getUserBalance, completeChore }) {
  const myBalance = getUserBalance(currentUser?.id);
  const myChores = chores.filter(c => c.assignedTo === currentUser?.id && !c.completed);
  const overdueChores = myChores.filter(c => new Date(c.nextDue) < new Date());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Your Balance</h3>
            <DollarSign className="text-indigo-600" size={20} />
          </div>
          <div className={`text-3xl font-bold ${myBalance.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(myBalance.net).toFixed(2)}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {myBalance.net >= 0 ? 'You are owed' : 'You owe'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Your Chores</h3>
            <Calendar className="text-purple-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{myChores.length}</div>
          <p className="text-sm text-gray-500 mt-1">
            {overdueChores.length} overdue
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
            <TrendingUp className="text-orange-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toFixed(2)}
          </div>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Upcoming Chores</h2>
        </div>
        <div className="p-6 space-y-3">
          {myChores.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No chores assigned. You're all caught up! 🎉</p>
          ) : (
            myChores.slice(0, 5).map(chore => {
              const isOverdue = new Date(chore.nextDue) < new Date();
              return (
                <div key={chore.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{chore.name}</h3>
                      {isOverdue && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{chore.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Due: {new Date(chore.nextDue).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => completeChore(chore.id)}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Check size={16} />
                    Complete
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6 space-y-3">
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expenses yet</p>
          ) : (
            expenses.slice(0, 5).map(expense => {
              const payer = users.find(u => u.id === expense.payerId) || { name: 'Unknown' };
              return (
                <div key={expense.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="text-gray-400" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{payer.name}</span> paid ${parseFloat(expense.amount).toFixed(2)} for {expense.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Chores View Component
function ChoresView({ chores, users, currentUser, completeChore, showAddChore, setShowAddChore, addChore }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Chores</h2>
        <button
          onClick={() => setShowAddChore(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Chore
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chores.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No chores yet. Add your first chore!</p>
          </div>
        ) : (
          chores.map(chore => {
            const assignee = users.find(u => u.id === chore.assignedTo) || { name: 'Unassigned' };
            const isOverdue = new Date(chore.nextDue) < new Date() && !chore.completed;
            
            return (
              <div key={chore.id} className={`bg-white rounded-xl p-6 shadow-sm border-2 ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{chore.name}</h3>
                  {chore.completed && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Done
                    </span>
                  )}
                  {isOverdue && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                      Overdue
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{chore.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Assigned to:</span>
                    <span className="font-medium text-gray-900">{assignee.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Frequency:</span>
                    <span className="font-medium text-gray-900">{chore.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Due:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(chore.nextDue).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!chore.completed && (
                  <button
                    onClick={() => completeChore(chore.id)}
                    className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Mark Complete
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {showAddChore && <AddChoreModal users={users} currentUser={currentUser} onClose={() => setShowAddChore(false)} onAdd={addChore} />}
    </div>
  );
}

// Expenses View Component
function ExpensesView({ expenses, users, currentUser, balances, showAddExpense, setShowAddExpense, addExpense, settleDebt }) {
  const myDebts = balances.filter(b => b.userFrom === currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Expenses & Balances</h2>
        <button
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {myDebts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">You Owe</h3>
          </div>
          <div className="p-6 space-y-3">
            {myDebts.map((debt) => {
              const creditor = users.find(u => u.id === debt.userTo) || { name: 'Unknown' };
              return (
                <div key={debt.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-gray-900">{creditor.name}</p>
                    <p className="text-2xl font-bold text-red-600">${parseFloat(debt.amount).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => {
                      const relatedExpense = expenses.find(e => 
                        e.payerId === debt.userTo && 
                        e.participants.includes(currentUser.id) && 
                        !e.settled
                      );
                      if (relatedExpense) settleDebt(relatedExpense.id);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Settle
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Expenses</h3>
        </div>
        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No expenses yet. Add your first expense!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map(expense => {
                  const payer = users.find(u => u.id === expense.payerId) || { name: 'Unknown' };
                  return (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${parseFloat(expense.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payer.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          expense.settled 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {expense.settled ? 'Settled' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddExpense && <AddExpenseModal users={users} currentUser={currentUser} onClose={() => setShowAddExpense(false)} onAdd={addExpense} />}
    </div>
  );
}

// Household View Component
function HouseholdView({ users, chores, expenses, currentUser }) {
  const completedChores = chores.filter(c => c.completed).length;
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Household Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <Users className="text-indigo-600 mb-3" size={24} />
          <div className="text-3xl font-bold text-gray-900">{users.length || 1}</div>
          <p className="text-sm text-gray-500 mt-1">Roommates</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <Calendar className="text-purple-600 mb-3" size={24} />
          <div className="text-3xl font-bold text-gray-900">{chores.length}</div>
          <p className="text-sm text-gray-500 mt-1">Total Chores</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <Check className="text-green-600 mb-3" size={24} />
          <div className="text-3xl font-bold text-gray-900">{completedChores}</div>
          <p className="text-sm text-gray-500 mt-1">Completed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <DollarSign className="text-orange-600 mb-3" size={24} />
          <div className="text-3xl font-bold text-gray-900">${totalExpenses.toFixed(0)}</div>
          <p className="text-sm text-gray-500 mt-1">Total Spent</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Household Members</h3>
        </div>
        <div className="p-6 space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Only you in this household</p>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{currentUser?.name}</h4>
                  <p className="text-sm text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
            </div>
          ) : (
            users.map(user => {
              const userChores = chores.filter(c => c.assignedTo === user.id);
              const completedByUser = userChores.filter(c => c.completed).length;
              
              return (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {completedByUser}/{userChores.length} chores done
                    </p>
                    <p className="text-xs text-gray-500">
                      {userChores.length > 0 ? Math.round((completedByUser / userChores.length) * 100) : 0}% completion
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Add Chore Modal
function AddChoreModal({ users, currentUser, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'WEEKLY',
    assignedTo: currentUser?.id || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Chore</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chore Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Take out trash"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Additional details..."
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {users.length > 0 ? (
                users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))
              ) : (
                <option value={currentUser?.id}>{currentUser?.name || 'Me'}</option>
              )}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Add Chore'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Expense Modal
function AddExpenseModal({ users, currentUser, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    payerId: currentUser?.id || '',
    participants: users.length > 0 ? users.map(u => u.id) : [currentUser?.id]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        ...formData,
        amount: parseFloat(formData.amount)
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (userId) => {
    if (formData.participants.includes(userId)) {
      if (formData.participants.length > 1) {
        setFormData({
          ...formData,
          participants: formData.participants.filter(id => id !== userId)
        });
      }
    } else {
      setFormData({
        ...formData,
        participants: [...formData.participants, userId]
      });
    }
  };

  const displayUsers = users.length > 0 ? users : [currentUser];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Expense</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Groceries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
            <select
              value={formData.payerId}
              onChange={(e) => setFormData({...formData, payerId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {displayUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Split Between</label>
            <div className="space-y-2">
              {displayUsers.map(user => (
                <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(user.id)}
                    onChange={() => toggleParticipant(user.id)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-900">{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.participants.length > 0 && formData.amount && (
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-900">
                Each person pays: <span className="font-bold">
                  ${(parseFloat(formData.amount || 0) / formData.participants.length).toFixed(2)}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChoreCastApp;