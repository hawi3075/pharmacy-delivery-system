import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const hash = (p) => bcrypt.hashSync(p, 10);
const users = [
  { name: 'Super Admin', email: 'super@gugudo.com', password: hash('Super@123'), role: 'SUPER_ADMIN' },
  { name: 'Pharmacist Admin', email: 'admin@gugudo.com', password: hash('Admin@123'), role: 'ADMIN' },
  { name: 'Demo Customer', email: 'customer@gugudo.com', password: hash('Customer@123'), role: 'CUSTOMER', phone: '0911000000' },
];
for (const u of users) await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u });

const cats = ['Antibiotics', 'Pain Relief', 'Vitamins', 'Diabetes Care', 'Allergy', 'First Aid'];
for (const name of cats) await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
const cat = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.name, c.id]));

if ((await prisma.product.count()) === 0) {
  await prisma.product.createMany({
    data: [
      { name: 'Amoxicillin 500mg', generic: 'Amoxicillin Trihydrate', price: 145, stock: 142, requiresRx: true, categoryId: cat['Antibiotics'], description: 'Broad-spectrum antibiotic for bacterial infections. Take as prescribed.', manufacturer: 'Novartis' },
      { name: 'Paracetamol 650mg', generic: 'Acetaminophen', price: 62, stock: 320, categoryId: cat['Pain Relief'], description: 'Relief from mild to moderate pain and fever.' },
      { name: 'Insulin Glargine SoloStar', generic: 'Insulin glargine', price: 840, stock: 6, requiresRx: true, categoryId: cat['Diabetes Care'], description: 'Long-acting insulin. Store refrigerated (2-8C).' },
      { name: 'Vitamin C 1000mg Chewable', price: 180, stock: 200, categoryId: cat['Vitamins'], description: 'Daily immune support, 60 chewable tablets.' },
      { name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', price: 95, stock: 150, categoryId: cat['Allergy'], description: 'Non-drowsy allergy relief.' },
      { name: 'Sterile Flex Bandages', price: 55, stock: 90, categoryId: cat['First Aid'], description: 'Assorted 50-count pack.' },
      { name: 'Metformin HCl 1000mg', generic: 'Metformin', price: 124, stock: 75, requiresRx: true, categoryId: cat['Diabetes Care'], description: 'Type 2 diabetes management.' },
      { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', price: 78, stock: 260, categoryId: cat['Pain Relief'], description: 'Anti-inflammatory pain relief. Take with food.' },
    ],
  });
}
console.log('Seeded. Logins:\n super@gugudo.com / Super@123\n admin@gugudo.com / Admin@123\n customer@gugudo.com / Customer@123');
await prisma.$disconnect();
