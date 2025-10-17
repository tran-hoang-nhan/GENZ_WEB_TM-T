const mongoose = require('mongoose');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/genz';
  await mongoose.connect(uri);
  console.log('Connected to Mongo for seeding');

  const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    brand: String,
    images: [String],
    stock: Number,
  });

  const Product = mongoose.model('Product', productSchema);

  const docs = [
    { name: 'GenZ Classic Helmet', description: 'Cơ bản, an toàn', price: 49.99, brand: 'GenZ', stock: 20 },
    { name: 'GenZ Pro Helmet', description: 'Hiệu năng cao, nhiều màu', price: 89.99, brand: 'GenZ', stock: 10 },
    { name: 'GenZ Kids Helmet', description: 'Nhẹ, phù hợp trẻ em', price: 39.99, brand: 'GenZ', stock: 15 }
  ];

  await Product.insertMany(docs);
  console.log('Seeded products');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
