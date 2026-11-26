import { makeProduct } from '../productFactory';

export const books = [
  makeProduct({
    title: 'The Quiet Algorithm', brand: 'Rift Press', category: 'books',
    price: 14.99, listPrice: 19.99, rating: 4.5, reviewCount: 980, stock: 55,
    bullets: ['A literary thriller about memory and machines', 'Shortlisted for the East Africa Book Prize', 'Paperback, 328 pages'],
    specs: { Author: 'N. Uwase', Pages: '328', Format: 'Paperback', Publisher: 'Rift Press' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Small Steps, Big Seasons', brand: 'Rift Press', category: 'books',
    price: 16.99, listPrice: 22.99, rating: 4.6, reviewCount: 640, stock: 70,
    bullets: ['A gentle guide to building habits that last', 'Practical prompts at the end of each chapter', 'Hardcover, 240 pages'],
    specs: { Author: 'A. Kamau', Pages: '240', Format: 'Hardcover', Publisher: 'Rift Press' },
  }),
  makeProduct({
    title: 'The Kigali Kitchen: 100 Recipes', brand: 'Soko Editions', category: 'books',
    price: 28.99, listPrice: 35.0, rating: 4.8, reviewCount: 420, stock: 38,
    bullets: ['One hundred home recipes from Kigali cooks', 'Full-colour photography throughout', 'Includes a market shopping guide'],
    specs: { Author: 'C. Mukamana', Pages: '256', Format: 'Hardcover', Publisher: 'Soko Editions' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Design for Everyone', brand: 'Northline', category: 'books',
    price: 32.99, listPrice: 45.0, rating: 4.7, reviewCount: 310, stock: 24,
    bullets: ['A practical introduction to inclusive design', 'Case studies from African products', 'Exercises for teams and students'],
    specs: { Author: 'T. Okafor', Pages: '312', Format: 'Paperback', Publisher: 'Northline' },
  }),
  makeProduct({
    title: 'A Field Guide to East African Birds', brand: 'Rift Press', category: 'books',
    price: 24.99, listPrice: 34.99, rating: 4.9, reviewCount: 510, stock: 19,
    bullets: ['Over 600 species with colour plates', 'Range maps and call descriptions', 'Pocket-friendly flexibound format'],
    specs: { Author: 'J. Niyonsaba', Pages: '480', Format: 'Flexibound', Publisher: 'Rift Press' },
  }),
  makeProduct({
    title: "The Founder's Notebook", brand: 'Northline', category: 'books',
    price: 18.99, listPrice: 24.99, rating: 4.4, reviewCount: 380, stock: 46,
    bullets: ['Interviews with 25 African founders', 'Worksheets for validating an idea', 'Ribbon marker and lay-flat binding'],
    specs: { Author: 'M. Adeyemi', Pages: '208', Format: 'Hardcover', Publisher: 'Northline' },
  }),
  makeProduct({
    title: 'Python in Practice', brand: 'Northline', category: 'books',
    price: 39.99, listPrice: 54.99, rating: 4.7, reviewCount: 890, stock: 31,
    bullets: ['Build eight real projects from scratch', 'Covers testing, packaging and deployment', 'Code samples updated for Python 3.13'],
    specs: { Author: 'K. Mensah', Pages: '560', Format: 'Paperback', Publisher: 'Northline' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'The Long Road Home', brand: 'Soko Editions', category: 'books',
    price: 13.99, listPrice: 18.99, rating: 4.3, reviewCount: 720, stock: 60,
    bullets: ['A sweeping family story across three cities', 'Book club notes included', 'Paperback, 296 pages'],
    specs: { Author: 'R. Uwimana', Pages: '296', Format: 'Paperback', Publisher: 'Soko Editions' },
  }),
  makeProduct({
    title: 'Money, Simply', brand: 'Northline', category: 'books',
    price: 17.99, listPrice: 24.99, rating: 4.5, reviewCount: 1120, stock: 64,
    bullets: ['Budgeting, saving and investing without jargon', 'Local examples for East African readers', 'Templates and a 30-day plan'],
    specs: { Author: 'P. Njoroge', Pages: '224', Format: 'Paperback', Publisher: 'Northline' },
  }),
  makeProduct({
    title: 'The Art of Quiet Leadership', brand: 'Rift Press', category: 'books',
    price: 21.99, listPrice: 29.99, rating: 4.6, reviewCount: 450, stock: 40,
    bullets: ['Leading without noise or ego', 'Stories from schools and small teams', 'End-of-chapter reflection questions'],
    specs: { Author: 'L. Habimana', Pages: '248', Format: 'Hardcover', Publisher: 'Rift Press' },
  }),
  makeProduct({
    title: 'Children of the Hills', brand: 'Soko Editions', category: 'books',
    price: 15.99, listPrice: 21.99, rating: 4.7, reviewCount: 610, stock: 52,
    bullets: ['A middle-grade adventure set in the hills', 'Ages 9-12, illustrated chapter openers', 'Includes a glossary of Kinyarwanda words'],
    specs: { Author: 'I. Mutoni', Pages: '224', Format: 'Paperback', Publisher: 'Soko Editions' },
  }),
];
