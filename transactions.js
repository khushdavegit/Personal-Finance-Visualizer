import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const transactions = await Transaction.find({}).sort({ date: -1 });
    return res.status(200).json(transactions);
  }

  if (req.method === 'POST') {
    try {
      const transaction = new Transaction(req.body);
      await transaction.save();
      return res.status(201).json(transaction);
    } catch (error) {
      return res.status(400).json({ error: 'Failed to add transaction' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Transaction.findByIdAndDelete(req.body.id);
      return res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
      return res.status(400).json({ error: 'Failed to delete transaction' });
    }
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
