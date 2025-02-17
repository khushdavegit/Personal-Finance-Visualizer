import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ffbb28'];

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ amount: '', date: '', description: '', category: 'Other' });

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => setTransactions(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newTransaction = await res.json();
      setTransactions([newTransaction, ...transactions]);
    }
  };

  const monthlyExpenses = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + t.amount;
    return acc;
  }, {});

  const categoryExpenses = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Food</option>
          <option>Transport</option>
          <option>Entertainment</option>
          <option>Bills</option>
          <option>Other</option>
        </select>
        <Button type="submit">Add</Button>
      </form>
      <ul>
        {transactions.map((t) => (
          <li key={t._id}>{t.date} - ${t.amount} - {t.description} ({t.category})</li>
        ))}
      </ul>
      <Card>
        <CardContent>
          <h3>Total Expenses: ${transactions.reduce((sum, t) => sum + t.amount, 0)}</h3>
          <h4>Most Recent Transactions:</h4>
          <ul>{transactions.slice(0, 5).map((t) => <li key={t._id}>{t.description} - ${t.amount}</li>)}</ul>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.keys(monthlyExpenses).map((key) => ({ month: key, amount: monthlyExpenses[key] }))}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={Object.keys(categoryExpenses).map((key, index) => ({ name: key, value: categoryExpenses[key], fill: COLORS[index % COLORS.length] }))} dataKey="value" nameKey="name">
                {Object.keys(categoryExpenses).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
